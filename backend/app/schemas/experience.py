from enum import Enum
from typing import Annotated
from uuid import UUID, uuid4

from pydantic import BaseModel, ConfigDict, Field, StringConstraints
from pydantic.alias_generators import to_camel

YearMonth = Annotated[str, StringConstraints(pattern=r'^\d{4}-\d{2}$')]


class ExperienceType(Enum):
  FULL_TIME = 'Full-time'
  PART_TIME = 'Part-time'
  INTERNSHIP = 'Internship'
  FREELANCE = 'Freelance'
  CONTRACT = 'Contract'


class Experience(BaseModel):
  id: UUID = Field(default_factory=uuid4)
  title: str
  organization: str
  type: ExperienceType
  location: str | None = None
  start_date: YearMonth
  end_date: YearMonth | None = None

  bullets: list[str] = Field(
    default_factory=list,
    description='List of bullet points describing the experience',
  )

  model_config = ConfigDict(
    alias_generator=to_camel,
    populate_by_name=True,
  )


class LLMResponseExperience(BaseModel):
  bullets: list[str] = Field(
    default_factory=list,
    description='List of bullet points describing the experience',
  )
