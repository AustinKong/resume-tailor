from bs4 import BeautifulSoup
from playwright.async_api import async_playwright
from pydantic import HttpUrl


class ScrapingService:
  def __init__(self):
    pass

  async def scrape_page(self, url: HttpUrl) -> str:
    async with async_playwright() as p:
      browser = await p.chromium.launch(headless=True)
      page = await browser.new_page()
      await page.goto(str(url), wait_until='networkidle')
      html = await page.content()
      await browser.close()
      return html

  def clean_html(self, html: str) -> str:
    soup = BeautifulSoup(html, 'html.parser')
    for tag in soup(['script', 'style', 'noscript']):
      tag.decompose()
    return ' '.join(soup.stripped_strings)[:10000]

  async def fetch_and_clean(self, url: HttpUrl) -> str:
    raw_html = await self.scrape_page(url)
    cleaned_text = self.clean_html(raw_html)
    return cleaned_text


_service = ScrapingService()

scrape_page = _service.scrape_page
clean_html = _service.clean_html
fetch_and_clean = _service.fetch_and_clean
