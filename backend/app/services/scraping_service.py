from bs4 import BeautifulSoup
from playwright.async_api import async_playwright
from pydantic import HttpUrl


async def scrape_page(url: HttpUrl) -> str:
  async with async_playwright() as p:
    browser = await p.chromium.launch(headless=True)
    page = await browser.new_page()
    await page.goto(str(url), wait_until='networkidle')
    html = await page.content()
    await browser.close()
    return html


def clean_html(html: str) -> str:
  soup = BeautifulSoup(html, 'html.parser')
  for tag in soup(['script', 'style', 'noscript']):
    tag.decompose()
  return ' '.join(soup.stripped_strings)[:10000]


async def fetch_and_clean(url: HttpUrl) -> str:
  raw_html = await scrape_page(url)
  cleaned_text = clean_html(raw_html)
  return cleaned_text
