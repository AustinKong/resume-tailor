from typing import Annotated
from uuid import UUID, uuid4

from pydantic import BeforeValidator, Field, HttpUrl

from app.schemas.dates import ISODate
from app.schemas.types import CamelModel, parse_json_list_as


class ListingBase(CamelModel):
  title: str
  company: str
  domain: str
  location: str | None = None
  description: str
  posted_date: ISODate | None = None


class Listing(ListingBase):
  id: UUID = Field(default_factory=uuid4)
  url: HttpUrl

  skills: Annotated[
    list[str],
    BeforeValidator(parse_json_list_as(str)),
    Field(default_factory=list),
  ]

  requirements: Annotated[
    list[str],
    BeforeValidator(parse_json_list_as(str)),
    Field(default_factory=list),
  ]
