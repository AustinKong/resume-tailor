import asyncio

from fastapi import APIRouter
from pydantic import HttpUrl

from app.prompts import LISTING_EXTRACTION_PROMPT
from app.schemas import Application, DuplicateListing, Listing, LLMResponseListing, ScrapeResult
from app.services import applications_service, listings_service, llm_service, scraping_service
from app.utils.errors import ValidationError
from app.utils.url import normalize_url

router = APIRouter(
  prefix='/listings',
  tags=['Listings'],
)


@router.post('/scrape', response_model=ScrapeResult)
async def scrape_listings(urls: list[HttpUrl]):
  if not urls:
    raise ValidationError('No URLs provided')

  # 1. Normalize all URLs and deduplicate
  normalized_urls = [normalize_url(url) for url in urls]
  unique_urls = list(dict.fromkeys(normalized_urls))

  # 2. Check which URLs already exist in database and mark as duplicates
  existing_listings = listings_service.get_by_urls(unique_urls)
  existing_listings_map = {listing.url: listing for listing in existing_listings}

  duplicates = [
    DuplicateListing(listing=listing, duplicate_of=listing) for listing in existing_listings
  ]

  # 3. Scrape URLs not in database
  urls_to_scrape = [url for url in unique_urls if url not in existing_listings_map]

  page_contents = await asyncio.gather(
    *[scraping_service.fetch_and_clean(url) for url in urls_to_scrape]
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

  scraped_listings: list[Listing] = [
    Listing(**llm_listing.model_dump(), url=url)
    for url, llm_listing in zip(urls_to_scrape, llm_listings, strict=False)
  ]

  # 4. Find similar/duplicate listings among newly scraped and mark as duplicates
  similar_duplicate_pairs = listings_service.find_similar(scraped_listings)

  duplicates.extend(
    [
      DuplicateListing(listing=listing, duplicate_of=dup)
      for listing, dup in similar_duplicate_pairs
    ]
  )

  similar_duplicate_ids = {pair[0].id for pair in similar_duplicate_pairs}
  unique = [listing for listing in scraped_listings if listing.id not in similar_duplicate_ids]

  return ScrapeResult(unique=unique, duplicates=duplicates)


@router.post('')
async def save_listings(listings: list[Listing]):
  saved_listings = []
  for listing in listings:
    saved_listing = listings_service.create(listing)
    application = Application(listing=listing)
    applications_service.create(application)
    saved_listings.append(saved_listing)

  return saved_listings
