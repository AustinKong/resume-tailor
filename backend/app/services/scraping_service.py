import base64
import re
import urllib.parse

from bs4 import BeautifulSoup
from playwright.async_api import Page, async_playwright
from pydantic import BaseModel, HttpUrl

from app.config import settings
from app.resources.scripts import (
  JS_INJECT_BASE,
  JS_MATERIALIZE_STYLES,
)
from app.utils.errors import ServiceError

SNAPSHOT_TAGS = [
  'script',
  'noscript',
  'iframe',
  'object',
  'embed',
]
BASIC_TAGS = [
  'style',
  'link',
  'meta',
  'svg',
  'canvas',
  'map',
  'area',
  'video',
  'audio',
  'picture',
  'source',
]
AGGRESSIVE_TAGS = [
  'nav',
  'header',
  'footer',
  'aside',
  'form',
  'button',
  'input',
  'select',
  'option',
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
  'subscribe',
  'login',
  'sign in',
]


class ScrapingResult(BaseModel):
  content: str
  html: str


# TODO: Need to respect robots.txt?
# Generally my-use case doesn't violate any legal guidelines. But we should include a
# "Ethical scraping" setting and respect robots.txt for those who enable it.
class ScrapingService:
  def _clean_html(self, html: str) -> str:
    soup = BeautifulSoup(html, 'html.parser')

    # Remove boilerplate tags
    tags_to_remove = SNAPSHOT_TAGS + BASIC_TAGS
    if settings.scraping.aggressive:
      tags_to_remove += AGGRESSIVE_TAGS
    for tag in soup(tags_to_remove):
      tag.decompose()

    # Remove elements containing boilerplate keywords
    if settings.scraping.aggressive:
      for tag in reversed(soup.find_all(True)):
        text = tag.get_text(strip=True)
        if text and any(keyword.lower() in text.lower() for keyword in BOILERPLATE_KEYWORDS):
          tag.decompose()

    text = ' '.join(soup.stripped_strings)
    text = re.sub(r'\s+', ' ', text)

    # Remove duplicate sentences
    if settings.scraping.aggressive:
      sentences = re.split(r'(?<=[.!?]) +', text)
      seen = set()
      filtered_sentences = []
      for sentence in sentences:
        normalized = sentence.strip().lower()
        if normalized not in seen:
          seen.add(normalized)
          filtered_sentences.append(sentence.strip())
      text = ' '.join(filtered_sentences)

    return text[: settings.scraping.max_length]

  async def _inline_assets(self, page: Page, base_url: str):
    # Ensures links are resolved correctly
    await page.evaluate(JS_INJECT_BASE, base_url)
    # Converts CSS-in-JS to static <style> tags
    await page.evaluate(JS_MATERIALIZE_STYLES)

    # Make all external CSS files inline <style> tags
    style_handles = await page.query_selector_all('link[rel="stylesheet"]')
    for handle in style_handles:
      try:
        href = await handle.get_attribute('href')
        if href:
          response = await page.request.get(href)
          if response.status == 200:
            css_text = await response.text()

            def replacer(match):
              url = match.group(1).strip('"\'')
              if not url.startswith(('http', 'https', 'data:')):
                resolved = urllib.parse.urljoin(base_url, url)
                return f'url("{resolved}")'
              return match.group(0)

            css_text = re.sub(r'url\(([^)]+)\)', replacer, css_text)
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
            await handle.evaluate('(el, dataUri) => { el.src = dataUri; }', data_uri)
            await handle.evaluate('el => el.removeAttribute("srcset")')
      except Exception:
        continue

  def _strip_scripts(self, html: str) -> str:
    soup = BeautifulSoup(html, 'html.parser')

    # Strip scripts and other problematic tags to prevent re-hydration errors
    for tag in soup(SNAPSHOT_TAGS):
      tag.decompose()

    # Remove preload links to prevent CORS errors
    for link in soup.find_all('link', rel='preload'):
      link.decompose()

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

        # Extract text content for LLM processing
        html = await page.content()
        content = self._clean_html(html)

        # Convert page into self-contained HTML file
        await self._inline_assets(page, str(url))
        html = await page.content()
        html = self._strip_scripts(html)

        await browser.close()

        return ScrapingResult(content=content, html=html)
    except Exception as e:
      raise ServiceError(f'Failed to fetch and clean page {url}: {str(e)}') from e
