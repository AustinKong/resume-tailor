from typing import Annotated, Generic, Literal, TypeVar
from uuid import UUID, uuid4

from pydantic import Field, HttpUrl

from app.schemas.dates import ISODate
from app.schemas.listing import Listing, ListingBase
from app.schemas.types import CamelModel

T = TypeVar('T')


class GroundedItem(CamelModel, Generic[T]):
  value: T
  quote: str | None = Field(
    description='The single most relevant substring from the text that justifies this item.'
  )


class ListingExtraction(ListingBase):
  skills: list[GroundedItem[str]] = Field(default_factory=list)
  requirements: list[GroundedItem[str]] = Field(default_factory=list)


# ===== Extraction (Output of LLM) =====


class ExtractionResponse(CamelModel):
  # OpenAI formatted outputs do not accept ListingExtraction | None due to AnyOf limitations
  title: str | None
  company: str | None
  domain: str | None
  location: str | None
  description: str | None
  posted_date: ISODate | None
  skills: list[GroundedItem[str]] = Field(default_factory=list)
  requirements: list[GroundedItem[str]] = Field(default_factory=list)

  error: str | None


# ===== Listing Drafts (Output of Scraping/Extraction) =====


class BaseListingDraft(CamelModel):
  id: UUID = Field(default_factory=uuid4)
  url: HttpUrl


class ListingDraftUnique(BaseListingDraft):
  status: Literal['unique'] = 'unique'
  listing: ListingExtraction
  html: str | None


class ListingDraftDuplicateUrl(BaseListingDraft):
  status: Literal['duplicate_url'] = 'duplicate_url'
  duplicate_of: Listing
  duplicate_of_application_id: UUID  # To allow frontend redirection


class ListingDraftDuplicateContent(BaseListingDraft):
  status: Literal['duplicate_content'] = 'duplicate_content'
  listing: ListingExtraction
  duplicate_of: Listing
  duplicate_of_application_id: UUID  # To allow frontend redirection
  html: str | None


class ListingDraftError(BaseListingDraft):
  status: Literal['error'] = 'error'
  error: str
  html: str | None


ListingDraft = Annotated[
  ListingDraftUnique | ListingDraftDuplicateUrl | ListingDraftDuplicateContent | ListingDraftError,
  Field(discriminator='status'),
]
