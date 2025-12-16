from enum import Enum
from typing import Generic, TypeVar
from uuid import UUID, uuid4

from pydantic import Field, HttpUrl

# TODO: Use the barrel exports
from app.schemas.dates import ISODate
from app.schemas.listing import Listing
from app.schemas.types import CamelModel

T = TypeVar('T')


class ScrapeStatus(str, Enum):
  COMPLETED = 'completed'
  DUPLICATE_URL = 'duplicate_url'
  DUPLICATE_SEMANTIC = 'duplicate_semantic'
  FAILED = 'failed'


class GroundedItem(CamelModel, Generic[T]):
  value: T
  quote: str | None = Field(
    description='The single most relevant substring from the text that justifies this item.'
  )


class ExtractionListing(CamelModel):
  title: str | None = None
  company: str | None = None
  domain: str | None = None
  location: str | None = None
  description: str | None = None
  posted_date: ISODate | None = None
  skills: list[GroundedItem[str]] = Field(default_factory=list)
  requirements: list[GroundedItem[str]] = Field(default_factory=list)
  error: str | None = None


class ScrapingListing(ExtractionListing):
  id: UUID = Field(default_factory=uuid4)
  url: HttpUrl
  html: str | None
  status: ScrapeStatus
  duplicate_of: Listing | None = None

  def to_listing(self) -> Listing:
    return Listing(
      **self.model_dump(),
      skills=[skill.value for skill in self.skills],
      requirements=[req.value for req in self.requirements],
    )

  @classmethod
  def from_error(cls, url: HttpUrl, error: str, html: str | None = None) -> 'ScrapingListing':
    return cls(
      url=url,
      status=ScrapeStatus.FAILED,
      error=error,
      html=html,
    )
