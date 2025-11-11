import re

from bs4 import BeautifulSoup
from playwright.async_api import async_playwright
from pydantic import HttpUrl


class ScrapingService:
  def __init__(self):
    pass

  async def _scrape_page(self, url: HttpUrl) -> str:
    async with async_playwright() as p:
      # browser = await p.chromium.launch(headless=True)
      browser = await p.chromium.launch(headless=False, slow_mo=1000)
      page = await browser.new_page()
      await page.goto(str(url), wait_until='networkidle')
      html = await page.content()
      await browser.close()
      return html

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
    return text[:10000]

  def _clean_html_aggresive(self, html: str) -> str:
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

    return ' '.join(filtered_sentences)[:10000]

  async def fetch_and_clean(self, url: HttpUrl, aggresive=True) -> str:
    raw_html = await self._scrape_page(url)

    if aggresive:
      cleaned_text = self._clean_html_aggresive(raw_html)
    else:
      cleaned_text = self._clean_html(raw_html)

    return cleaned_text


_service = ScrapingService()

fetch_and_clean = _service.fetch_and_clean
