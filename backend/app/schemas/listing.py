from datetime import date
from uuid import UUID, uuid4

from pydantic import Field, HttpUrl, field_validator

from app.schemas.types import CamelModel, parse_json_list


class LLMResponseListing(CamelModel):
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

  @field_validator('skills', 'requirements', mode='before')
  @classmethod
  def parse_fields(cls, v):
    return parse_json_list(v)


class Listing(LLMResponseListing):
  id: UUID = Field(default_factory=uuid4)
  url: HttpUrl
  resume_ids: list[UUID] = Field(
    default_factory=list,
    description='List of resume IDs associated with this listing (populated via JOIN)',
  )


class DuplicateListing(CamelModel):
  listing: Listing
  duplicate_of: Listing


class ScrapeResult(CamelModel):
  unique: list[Listing]
  duplicates: list[DuplicateListing]
