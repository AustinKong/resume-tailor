import asyncio

from fastapi import APIRouter
from pydantic import HttpUrl

from app.resources.prompts import LISTING_EXTRACTION_PROMPT
from app.schemas import (
  Application,
  ExtractionListing,
  GroundedItem,
  Listing,
  ScrapeStatus,
  ScrapingListing,
)
from app.services import applications_service, listings_service, llm_service, scraping_service
from app.utils.errors import ValidationError
from app.utils.url import normalize_url

router = APIRouter(
  prefix='/listings',
  tags=['Listings'],
)


"""
Scrapes the provided URLs and returns draft listings in one of four states:

1. COMPLETED
    - Fresh scrape.
    - 'html': Populated (Snapshot available).
    - 'skills': Grounded (Quotes populated).
    - 'duplicate_of': None.

2. DUPLICATE_URL (Exact Match)
    - URL already exists in DB. Scrape was skipped.
    - 'html': None.
    - 'skills': Ungrounded (Quotes are None).
    - 'duplicate_of': Populated with the existing DB listing.

3. DUPLICATE_SEMANTIC (Content Match)
    - Fresh scrape, but content looks identical to an existing listing.
    - 'html': Populated.
    - 'skills': Grounded.
    - 'duplicate_of': Populated with the similar DB listing.

4. FAILED
    - Scrape or LLM extraction failed.
    - 'html': None.
    - 'error': Populated with the exception message.
    - All other fields are empty/default.
"""


@router.post('/scrape', response_model=list[ScrapingListing])
async def scrape_listings(urls: list[HttpUrl]):
  if not urls:
    raise ValidationError('No URLs provided')

  results: list[ScrapingListing] = []

  unique_urls = list(dict.fromkeys([normalize_url(url) for url in urls]))

  existing_listings = listings_service.get_by_urls(unique_urls)
  existing_listings_map = {listing.url: listing for listing in existing_listings}

  urls_to_scrape: list[HttpUrl] = []
  # Filter out URLs that already exist
  for url in unique_urls:
    if url in existing_listings_map:
      existing = existing_listings_map[url]
      results.append(
        ScrapingListing(
          **existing.model_dump(),
          skills=[GroundedItem(value=s, quote=None) for s in existing.skills],
          requirements=[GroundedItem(value=r, quote=None) for r in existing.requirements],
          status=ScrapeStatus.DUPLICATE_URL,
          duplicate_of=existing,
        )
      )
    else:
      urls_to_scrape.append(url)

  scrape_results = await asyncio.gather(
    *[scraping_service.fetch_and_clean(url) for url in urls_to_scrape], return_exceptions=True
  )

  # Filter out scrapes that failed
  valid_pairs = []
  for url, result in zip(urls_to_scrape, scrape_results, strict=True):
    if isinstance(result, Exception):
      results.append(ScrapingListing.from_error(url, str(result)))
    else:
      valid_pairs.append((url, result))

  # TODO: Add cannot scrape handling. Use LLM to return an error state if the scraped content
  # does not look like a job listing.
  valid_pages = [p[1] for p in valid_pairs]
  llm_results: list[ExtractionListing] = await asyncio.gather(
    *[
      llm_service.call_structured(
        input=LISTING_EXTRACTION_PROMPT.format(content=page.content),
        response_model=ExtractionListing,
      )
      for page in valid_pages
    ]
  )

  for (url, page), extraction in zip(valid_pairs, llm_results, strict=True):
    if extraction.error:
      results.append(ScrapingListing.from_error(url, extraction.error, html=page.html))
      continue

    draft = ScrapingListing(
      **extraction.model_dump(), url=url, html=page.html, status=ScrapeStatus.COMPLETED
    )

    similar_match = listings_service.find_similar(draft.to_listing())

    if similar_match:
      draft.status = ScrapeStatus.DUPLICATE_SEMANTIC
      draft.duplicate_of = similar_match

    # Add semantic duplicates and unique listings
    results.append(draft)

  return results


@router.get('', response_model=list[Listing])
async def get_listings():
  return listings_service.list_all()


# Frontend flattens into Listing for us
@router.post('')
async def save_listings(listings: list[Listing]):
  saved_listings = []
  for listing in listings:
    saved_listing = listings_service.create(listing)
    application = Application(listing=listing)
    applications_service.create(application)
    saved_listings.append(saved_listing)

  return saved_listings
