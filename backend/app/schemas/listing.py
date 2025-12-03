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

  skills: list[str] = Field(
    default_factory=list,
    description=(
      'List of specific tools, software, certifications, licenses, or hard skills '
      'mentioned (e.g., Excel, CPR Certified, Forklift, Python, Salesforce, GAAP).'
    ),
  )

  requirements: list[str] = Field(
    default_factory=list,
    description=(
      'A list of 5-10 distinct, atomic requirements. These can be soft skills, '
      'years of experience, or specific duties.'
    ),
  )

  # Ensures skills and requirements are always lists when parsing from database
  @field_validator('skills', 'requirements', mode='before')
  @classmethod
  def parse_fields(cls, v):
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
