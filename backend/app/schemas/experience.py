from enum import Enum
from uuid import UUID, uuid4

from pydantic import Field

from app.schemas.dates import ISOYearMonth
from app.schemas.types import CamelModel


class ExperienceType(Enum):
  FULL_TIME = 'Full-time'
  PART_TIME = 'Part-time'
  INTERNSHIP = 'Internship'
  FREELANCE = 'Freelance'
  CONTRACT = 'Contract'


class Experience(CamelModel):
  id: UUID = Field(default_factory=uuid4)
  title: str
  organization: str
  type: ExperienceType
  location: str | None = None
  start_date: ISOYearMonth
  end_date: ISOYearMonth | None = None

  bullets: list[str] = Field(
    default_factory=list,
    description='List of bullet points describing the experience',
  )


class LLMResponseExperience(CamelModel):
  bullets: list[str] = Field(
    default_factory=list,
    description='List of bullet points describing the experience',
  )
