import asyncio

from backend.app.utils.url import normalize_url
from fastapi import APIRouter
from pydantic import HttpUrl
from schemas.listing import Listing
from services import listings_service, scraping_service

router = APIRouter(
  prefix='/listings',
  tags=['Listings'],
)


@router.get('', response_model=list[Listing])
async def get_listings():
  listings = listings_service.load_listings()
  return listings


@router.post('')
async def scrape_listings(urls: list[HttpUrl]):
  # TODO: Dont actually remove duplicates, mark them as duplicate and return so the user knows
  # 1. Normalize all URLs
  # 2. Remove duplicates within provided URLs
  # 3. Remove duplicates with existing listings
  # 4. Scrape all unique URLs concurrently and LLM-process content
  # 5. Remove duplicates based off heuristics from scraped content and existing listings
  # 6. Save new listings
  # 7. Return new listings
  # 8. If user wants to forcefully scrape the duplicates, provide an endpoint for that which appends
  # a special param to the URL
  urls = list(set([normalize_url(url) for url in urls]))

  page_contents = await asyncio.gather(*[scraping_service.fetch_and_clean(url) for url in urls])

  # TODO: More processing
  return page_contents
