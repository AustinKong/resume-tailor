from typing import Annotated
from uuid import UUID, uuid4

from pydantic import BeforeValidator, Field, HttpUrl

from app.schemas.dates import ISODate
from app.schemas.types import CamelModel, parse_json_list_as


class LLMResponseListing(CamelModel):
  title: str
  company: str
  domain: str
  location: str | None = None
  description: str
  posted_date: ISODate | None = None

  skills: Annotated[
    list[str],
    BeforeValidator(parse_json_list_as(str)),
    Field(
      default_factory=list,
      description=(
        'List of specific tools, software, certifications, licenses, or hard skills '
        'mentioned (e.g., Excel, CPR Certified, Forklift, Python, Salesforce, GAAP).'
      ),
    ),
  ]

  requirements: Annotated[
    list[str],
    BeforeValidator(parse_json_list_as(str)),
    Field(
      default_factory=list,
      description=(
        'A list of 5-10 distinct, atomic requirements. These can be soft skills, '
        'years of experience, or specific duties.'
      ),
    ),
  ]


class Listing(LLMResponseListing):
  id: UUID = Field(default_factory=uuid4)
  url: HttpUrl


class DuplicateListing(CamelModel):
  listing: Listing
  duplicate_of: Listing


class ScrapeResult(CamelModel):
  unique: list[Listing]
  duplicates: list[DuplicateListing]
