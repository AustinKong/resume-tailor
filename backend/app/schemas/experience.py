from enum import Enum
from uuid import UUID, uuid4

from pydantic import BaseModel, Field

from app.schemas.types import CamelModel, YearMonth


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
  start_date: YearMonth
  end_date: YearMonth | None = None

  bullets: list[str] = Field(
    default_factory=list,
    description='List of bullet points describing the experience',
  )


class LLMResponseExperience(BaseModel):
  bullets: list[str] = Field(
    default_factory=list,
    description='List of bullet points describing the experience',
  )
