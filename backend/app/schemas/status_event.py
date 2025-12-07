from datetime import date
from enum import Enum
from uuid import UUID, uuid4

from pydantic import Field

from app.schemas.types import CamelModel


class StatusEnum(Enum):
  SAVED = 'SAVED'
  APPLIED = 'APPLIED'
  INTERVIEW = 'INTERVIEW'
  ACCEPTED = 'ACCEPTED'
  REJECTED = 'REJECTED'
  GHOSTED = 'GHOSTED'


class StatusEvent(CamelModel):
  id: UUID = Field(default_factory=uuid4)
  status: StatusEnum
  stage: int
  date: date
  notes: str | None = None
