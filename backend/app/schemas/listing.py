import json
from datetime import date
from uuid import UUID, uuid4

from pydantic import BaseModel, ConfigDict, Field, HttpUrl, field_validator
from pydantic.alias_generators import to_camel


# TODO: Make field_validator a reusable utility function
class LLMResponseListing(BaseModel):
  title: str
  company: str
  location: str | None = None
  description: str
  posted_date: date | None = None

  keywords: list[str] = Field(
    default_factory=list, description='List of keywords associated with the listing'
  )

  # Ensures keywords is always a list when parsing from database
  @field_validator('keywords', mode='before')
  @classmethod
  def parse_keywords(cls, v):
    if isinstance(v, str):
      return json.loads(v)
    if not v:
      return None
    return v

  model_config = ConfigDict(
    alias_generator=to_camel,
    populate_by_name=True,
  )


class Listing(LLMResponseListing):
  id: UUID = Field(default_factory=uuid4)
  url: HttpUrl
  resume_ids: list[str] = Field(
    default_factory=list,
    description='List of resume IDs associated with this listing (populated via JOIN)',
  )


class DuplicateListing(BaseModel):
  listing: Listing
  duplicate_of: Listing

  model_config = ConfigDict(
    alias_generator=to_camel,
    populate_by_name=True,
  )


class ScrapeResult(BaseModel):
  unique: list[Listing]
  duplicates: list[DuplicateListing]

  model_config = ConfigDict(
    alias_generator=to_camel,
    populate_by_name=True,
  )
