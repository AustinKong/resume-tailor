from datetime import date
from typing import Annotated, Literal
from uuid import UUID

from fastapi import APIRouter, Body, Query
from pydantic import HttpUrl

from app.resources.prompts import LISTING_EXTRACTION_PROMPT
from app.schemas import (
  Application,
  ExtractionResponse,
  Listing,
  ListingDraft,
  ListingDraftDuplicateContent,
  ListingDraftDuplicateUrl,
  ListingDraftError,
  ListingDraftUnique,
  ListingExtraction,
  ListingSummary,
  Page,
  StatusEnum,
)
from app.services import applications_service, listings_service, llm_service, scraping_service
from app.utils.url import normalize_url

router = APIRouter(
  prefix='/listings',
  tags=['Listings'],
)


@router.post('/draft', response_model=ListingDraft)
async def ingest_listing(
  url: Annotated[HttpUrl, Body()],
  id: Annotated[UUID, Body()],
  content: Annotated[str | None, Body()] = None,
) -> ListingDraft:
  url = normalize_url(url)
  html = None

  existing_listing = listings_service.get_by_url(url)

  if existing_listing:
    application = applications_service.get_by_listing_id(existing_listing.id)
    return ListingDraftDuplicateUrl(
      id=id,
      url=url,
      duplicate_of=existing_listing,
      duplicate_of_application_id=application.id,
    )

  if content is None:
    try:
      page = await scraping_service.fetch_and_clean(url)
    except Exception as e:
      return ListingDraftError(
        id=id,
        url=url,
        error=str(e),
        html=None,
      )

    content = page.content
    html = page.html

  try:
    extraction = await llm_service.call_structured(
      input=LISTING_EXTRACTION_PROMPT.format(
        current_date=date.today().isoformat(), content=content
      ),
      response_model=ExtractionResponse,
    )
  except Exception as e:
    # Unexpected extraction error
    return ListingDraftError(
      id=id,
      url=url,
      error=str(e),
      html=html,
    )

  # Expected error (Not a listing etc.)
  if extraction.error is not None:
    return ListingDraftError(
      id=id,
      url=url,
      error=extraction.error or 'Unknown extraction error',
      html=html,
    )
  else:
    # Successful extraction but missing data
    try:
      listing = ListingExtraction.model_validate(extraction.model_dump())
    except Exception as e:
      return ListingDraftError(
        id=id,
        url=url,
        error=f'LLM success indicated but data was incomplete: {str(e)}',
        html=html,
      )

  similar_match = listings_service.find_similar(
    Listing(
      **listing.model_dump(exclude={'skills', 'requirements'}),
      skills=[skill.value for skill in listing.skills],
      requirements=[req.value for req in listing.requirements],
      id=id,
      url=url,
    )
  )

  if similar_match:
    application = applications_service.get_by_listing_id(similar_match.id)
    return ListingDraftDuplicateContent(
      id=id,
      url=url,
      listing=listing,
      duplicate_of=similar_match,
      duplicate_of_application_id=application.id,
      html=html,
    )

  return ListingDraftUnique(id=id, url=url, listing=listing, html=html)


@router.get('', response_model=Page[ListingSummary])
async def get_listings(
  page: int = 1,
  size: int = 10,
  search: str | None = None,
  status: Annotated[list[StatusEnum] | None, Query()] = None,
  sort_by: Literal['title', 'company', 'posted_at', 'updated_at'] | None = None,
  sort_dir: Literal['asc', 'desc'] | None = None,
):
  return listings_service.list_all(page, size, search, status, sort_by, sort_dir)


@router.get('/{id}', response_model=Listing)
async def get_listing(id: UUID):
  return listings_service.get(id)


@router.post('')
async def save_listing(listing: Listing):
  saved_listing = listings_service.create(listing)
  application = Application(listing_id=listing.id)
  applications_service.create(application)
  return saved_listing
