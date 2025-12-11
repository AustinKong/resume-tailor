from datetime import UTC, datetime
from enum import Enum
from uuid import UUID, uuid4

from pydantic import Field

from app.schemas.dates import ISODatetime
from app.schemas.types import CamelModel


class StatusEnum(Enum):
  SAVED = 'SAVED'
  APPLIED = 'APPLIED'
  SCREENING = 'SCREENING'
  INTERVIEW = 'INTERVIEW'
  OFFER_RECEIVED = 'OFFER_RECEIVED'
  ACCEPTED = 'ACCEPTED'
  REJECTED = 'REJECTED'
  GHOSTED = 'GHOSTED'
  WITHDRAWN = 'WITHDRAWN'
  RESCINDED = 'RESCINDED'


class StatusEvent(CamelModel):
  id: UUID = Field(default_factory=uuid4)
  status: StatusEnum
  stage: int
  created_at: ISODatetime = Field(default_factory=lambda: datetime.now(UTC))
  notes: str | None = None
