from datetime import datetime
from uuid import UUID, uuid4

from pydantic import Field

from app.schemas.listing import Listing
from app.schemas.status_event import StatusEnum, StatusEvent
from app.schemas.types import CamelModel


def default_status_events():
  return [StatusEvent(status=StatusEnum.SAVED, stage=0, created_at=datetime.now())]


class Application(CamelModel):
  id: UUID = Field(default_factory=uuid4)
  listing: Listing
  resume_id: UUID | None = None
  status_events: list[StatusEvent] = Field(default_factory=default_status_events)
