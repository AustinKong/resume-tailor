from datetime import date
from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Body
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
)
from app.services import applications_service, listings_service, llm_service, scraping_service
from app.utils.url import normalize_url

router = APIRouter(
  prefix='/listings',
  tags=['Listings'],
)


@router.post('/scrape', response_model=ListingDraft)
async def scrape_listing(
  url: Annotated[HttpUrl, Body()], id: Annotated[UUID, Body()]
) -> ListingDraft:
  normalized_url = normalize_url(url)

  existing_listing = listings_service.get_by_url(normalized_url)

  if existing_listing:
    application = applications_service.get_by_listing_id(existing_listing.id)
    return ListingDraftDuplicateUrl(
      id=id,
      url=normalized_url,
      duplicate_of=existing_listing,
      duplicate_of_application_id=application.id,
    )

  try:
    page = await scraping_service.fetch_and_clean(normalized_url)
  except Exception as e:
    return ListingDraftError(
      id=id,
      url=normalized_url,
      error=str(e),
      html=None,
    )

  return await extract_listing(id, normalized_url, page.content, page.html)


@router.post('/extract', response_model=ListingDraft)
async def extract_listing(
  id: Annotated[UUID, Body()],
  url: Annotated[HttpUrl, Body()],
  content: Annotated[str, Body()],
  html: Annotated[str | None, Body()] = None,  # Should not be set during normal usage
):
  try:
    extraction = await llm_service.call_structured(
      input=LISTING_EXTRACTION_PROMPT.format(
        current_date=date.today().isoformat(), content=content
      ),
      response_model=ExtractionResponse,
    )
  except Exception as e:
    # Unexpected scraping error
    return ListingDraftError(
      id=id,
      url=url,
      error=str(e),
      html=None,
    )

  # Expected error (Not a listing etc.)
  if extraction.error is not None:
    return ListingDraftError(
      id=id,
      url=url,
      error=extraction.error or 'Unknown extraction error',
      html=None,
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
        html=None,
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
      html=html or '',
    )

  return ListingDraftUnique(id=id, url=url, listing=listing, html=html or '')


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
