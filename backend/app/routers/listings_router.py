import asyncio

from fastapi import APIRouter, HTTPException, status
from pydantic import HttpUrl

from app.schemas.listing import Listing, LLMResponseListing
from app.services import listings_service, llm_service, scraping_service
from app.utils.url import normalize_url

LISTING_EXTRACTION_PROMPT = """
Extract job listing information from the content below:
{content}
"""

router = APIRouter(
  prefix='/listings',
  tags=['Listings'],
)


@router.get('', response_model=list[Listing])
async def get_listings():
  listings = listings_service.load_listings()
  return listings


@router.post('/scrape')
async def scrape_listings(urls: list[HttpUrl]):
  if not urls:
    raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail='No URLs provided')

  # 1. Normalize all URLs and remove duplicates within provided URLs
  urls = [normalize_url(url) for url in urls]
  unique_urls = set(urls)

  # 2. Remove URLs that already exist in the database
  unique_urls -= set(listings_service.get_existing_urls(list(unique_urls)))

  # 3. Scrape all unique URLs concurrently and LLM-process content
  page_contents = await asyncio.gather(
    *[scraping_service.fetch_and_clean(url) for url in unique_urls]
  )

  llm_listings: list[LLMResponseListing] = await asyncio.gather(
    *[
      llm_service.call_structured(
        input=LISTING_EXTRACTION_PROMPT.format(content=content),
        response_model=LLMResponseListing,
      )
      for content in page_contents
    ]
  )

  new_listings: list[Listing] = [
    Listing(**llm_listing.model_dump(), url=url)
    for url, llm_listing in zip(unique_urls, llm_listings, strict=False)
  ]

  # 4. Find similar/duplicate listings using both semantic and heuristic methods
  duplicate_pairs = listings_service.find_similar_listings(new_listings)

  duplicate_listing_ids = {pair[0].id for pair in duplicate_pairs}

  unique_listings = [listing for listing in new_listings if listing.id not in duplicate_listing_ids]

  return {
    'unique': unique_listings,
    'duplicates': [
      {
        'listing': pair[0],
        'duplicate_of': pair[1],
      }
      for pair in duplicate_pairs
    ],
  }


@router.post('')
async def save_listings(listings: list[Listing]):
  listings = listings_service.save_listings(listings)
  return listings
