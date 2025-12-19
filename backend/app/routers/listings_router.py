import asyncio
from uuid import UUID

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
Scrapes the provided URLs and returns draft listings in one of the following states:

1. UNIQUE (Status: COMPLETED)
    - Successful fresh scrape and extraction.
    - 'html': Populated (Snapshot available).
    - 'skills'/'requirements': Grounded (Contains original quotes).
    - 'duplicate_of': None.

2. DUPLICATE_URL (Exact Match)
    - URL (normalized) already exists in the database. 
    - Scrape and LLM extraction are skipped for performance.
    - 'html': None.
    - 'skills'/'requirements': Ungrounded (Quotes are None).
    - 'duplicate_of': Populated with the existing database listing.

3. DUPLICATE_SEMANTIC (Content Match)
    - Fresh scrape performed, but LLM content matches an existing record (e.g., same job on 
      different sites).
    - 'html': Populated (Useful for verifying the match).
    - 'skills'/'requirements': Grounded.
    - 'duplicate_of': Populated with the similar database listing.

4. FAILED (Error States)
    - Case A: NO_HTML_HAS_ERROR
        - Scraper was blocked (e.g., 403, Cloudflare) or network timeout.
        - 'html': None.
        - 'error': Populated with network/proxy exception message.
    - Case B: HAS_HTML_HAS_ERROR
        - Scraper succeeded, but LLM failed to parse the content into the schema.
        - 'html': Populated (Crucial for manual extraction override).
        - 'error': Populated with LLM parsing/validation error.
    - Case C: HAS_HTML_NO_ERROR (Anomalous State)
        - Data successfully retrieved but extraction resulted in empty/insufficient content.
        - Treat as FAILED for UI purposes to trigger manual review.
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
          **existing.model_dump(exclude={'skills', 'requirements'}),
          skills=[GroundedItem(value=s, quote=None) for s in existing.skills],
          requirements=[GroundedItem(value=r, quote=None) for r in existing.requirements],
          status=ScrapeStatus.DUPLICATE_URL,
          duplicate_of=existing,
          html=None,
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


@router.post('/extract', response_model=ScrapingListing)
async def extract_listing(id: UUID, url: HttpUrl, content: str):
  extraction = await llm_service.call_structured(
    input=LISTING_EXTRACTION_PROMPT.format(content=content),
    response_model=ExtractionListing,
  )

  if extraction.error:
    return ScrapingListing.from_error(
      id=id,
      url=url,
      error=extraction.error,
    )

  draft = ScrapingListing(
    **extraction.model_dump(),
    url=url,
    html=None,
    status=ScrapeStatus.COMPLETED,
    id=id,
  )

  similar_match = listings_service.find_similar(draft.to_listing())

  if similar_match:
    draft.status = ScrapeStatus.DUPLICATE_SEMANTIC
    draft.duplicate_of = similar_match

  return draft


@router.get('', response_model=list[Listing])
async def get_listings():
  return listings_service.list_all()


# TODO: Should POST take singular listings to be more RESTful?
@router.post('')
async def save_listings(listings: list[Listing]):
  saved_listings = []
  for listing in listings:
    saved_listing = listings_service.create(listing)
    application = Application(listing=listing)
    applications_service.create(application)
    saved_listings.append(saved_listing)

  return saved_listings
