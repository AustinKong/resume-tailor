from datetime import date
from uuid import UUID, uuid4

from pydantic import BaseModel, ConfigDict, Field, HttpUrl
from pydantic.alias_generators import to_camel


class Listing(BaseModel):
  id: UUID = Field(default_factory=uuid4)
  url: HttpUrl
  title: str
  company: str
  location: str | None = None
  description: str
  posted_date: date | None = None

  keywords: list[str] = Field(
    default_factory=list, description='List of keywords associated with the listing'
  )

  model_config = ConfigDict(
    alias_generator=to_camel,
    populate_by_name=True,
  )
