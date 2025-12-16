import base64
import re

from bs4 import BeautifulSoup
from playwright.async_api import Page, async_playwright
from pydantic import BaseModel, HttpUrl

from app.config import settings
from app.prompts import MARKJS_INJECTION_CODE
from app.utils.errors import ServiceError


class ScrapingResult(BaseModel):
  content: str
  html: str


class ScrapingService:
  def __init__(self):
    pass

  def _clean_html(self, html: str) -> str:
    BOILERPLATE_TAGS = [
      'script',
      'style',
      'noscript',
    ]

    soup = BeautifulSoup(html, 'html.parser')
    for tag in soup(BOILERPLATE_TAGS):
      tag.decompose()

    text = ' '.join(soup.stripped_strings)
    text = re.sub(r'\s+', ' ', text)
    return text[: settings.scraping.max_length]

  def _clean_html_aggressive(self, html: str) -> str:
    """
    Aggressively cleans HTML for LLM input by:

    1. Removing scripts, styles, and noscript tags.
    2. Deleting tags containing boilerplate keywords (e.g., privacy, cookies).
    3. Normalizing whitespace.
    4. Removing duplicate sentences to reduce verbosity.
    """
    BOILERPLATE_TAGS = [
      'script',
      'style',
      'noscript',
      'a',
      'button',
      'form',
      'input',
      'select',
      'option',
      'nav',
      'header',
      'footer',
      'aside',
      'iframe',
      'img',
      'video',
    ]

    BOILERPLATE_KEYWORDS = [
      'terms of service',
      'privacy policy',
      'cookie',
      'apply now',
      'language',
      'legal',
      'candidate privacy policy',
      'accept cookies',
      'download',
      'newsletter',
    ]

    soup = BeautifulSoup(html, 'html.parser')
    for tag in soup(BOILERPLATE_TAGS):
      tag.decompose()

    # Remove tags in DFS post-order manner to avoid deleting potentially useful content
    # BeautifulSoup find_all returns tags in document order (pre-order)
    for tag in reversed(soup.find_all(True)):
      text = tag.get_text(strip=True)
      if text and any(keyword.lower() in text.lower() for keyword in BOILERPLATE_KEYWORDS):
        tag.decompose()

    text = ' '.join(soup.stripped_strings)
    text = re.sub(r'\s+', ' ', text)

    sentences = re.split(r'(?<=[.!?]) +', text)
    seen = set()
    filtered_sentences = []
    for sentence in sentences:
      normalized = sentence.strip().lower()
      if normalized not in seen:
        seen.add(normalized)
        filtered_sentences.append(sentence.strip())

    return ' '.join(filtered_sentences)[: settings.scraping.max_length]

  async def _inline_assets(self, page: Page, base_url: str):
    await page.evaluate(
      """(url) => {
          if (!document.querySelector('base')) {
            const base = document.createElement('base');
            base.href = url;
            (document.head || document.body).prepend(base);
          }
        }""",
      base_url,
    )

    # Make all external CSS files inline <style> tags
    style_handles = await page.query_selector_all('link[rel="stylesheet"]')
    for handle in style_handles:
      try:
        href = await handle.get_attribute('href')
        if href:
          response = await page.request.get(href)
          if response.status == 200:
            css_text = await response.text()
            await handle.evaluate(
              (
                '(el, css) => { const style = document.createElement("style"); '
                'style.textContent = css; el.replaceWith(style); }'
              ),
              css_text,
            )
      except Exception:
        continue

    # Make all external images inline data URIs (base64-encoded)
    img_handles = await page.query_selector_all('img')
    for handle in img_handles:
      try:
        src = await handle.get_attribute('src')
        if src and not src.startswith('data:'):
          response = await page.request.get(src)
          if response.status == 200:
            img_bytes = await response.body()
            img_base64 = base64.b64encode(img_bytes).decode('utf-8')
            mime_type = response.headers.get('content-type', 'image/png')
            data_uri = f'data:{mime_type};base64,{img_base64}'
            await handle.evaluate(
              '(el, dataUri) => { el.src = dataUri; }',
              data_uri,
            )
            await handle.evaluate('el => el.removeAttribute("srcset")')
      except Exception:
        continue

  def _strip_scripts(self, html: str) -> str:
    soup = BeautifulSoup(html, 'html.parser')

    # Strip scripts to prevent re-hydration errors
    for tag in soup(['script', 'noscript', 'iframe', 'object', 'embed', 'meta']):
      tag.decompose()

    # Most meta tags are useless or destructive, except charset
    if soup.head:
      new_meta = soup.new_tag('meta', charset='utf-8')
      soup.head.insert(0, new_meta)

    # Remove event handlers
    for tag in soup.find_all(True):
      for attr in list(tag.attrs):
        if attr.startswith('on'):
          del tag[attr]

    return str(soup)

  def _inject_markjs(self, html: str) -> str:
    if '</body>' in html:
      return html.replace('</body>', f'{MARKJS_INJECTION_CODE}</body>')
    # Some pages might not have <body> tag
    return f'{html}{MARKJS_INJECTION_CODE}'

  async def fetch_and_clean(self, url: HttpUrl) -> ScrapingResult:
    try:
      async with async_playwright() as p:
        browser = await p.chromium.launch(headless=settings.scraping.headless)
        context = await browser.new_context(
          user_agent=(
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 '
            '(KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
          )
        )
        page = await context.new_page()
        await page.goto(str(url), wait_until='networkidle')
        await page.wait_for_timeout(2000)

        # Use BeautifulSoup to extract text content (for LLM input)
        raw_html = await page.content()
        content = (
          self._clean_html_aggressive(raw_html)
          if settings.scraping.aggressive
          else self._clean_html(raw_html)
        )

        # Use Playwright + BeautifulSoup to produce a "snapshot" of the page content
        await self._inline_assets(page, str(url))
        heavy_html = await page.content()
        static_html = self._strip_scripts(heavy_html)
        html = self._inject_markjs(static_html)

        await browser.close()

        return ScrapingResult(content=content, html=html)
    except Exception as e:
      raise ServiceError(f'Failed to fetch and clean page {url}: {str(e)}') from e
