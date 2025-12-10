from datetime import datetime
from uuid import UUID, uuid4

from pydantic import Field, computed_field

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

  @computed_field
  def current_status(self) -> StatusEnum:
    sorted_events = sorted(self.status_events, key=lambda e: e.created_at)
    return sorted_events[-1].status

  @computed_field
  def current_stage(self) -> int:
    sorted_events = sorted(self.status_events, key=lambda e: e.created_at)
    return sorted_events[-1].stage

  def _get_event_priority(self, event: StatusEvent) -> int:
    match event.status:
      case StatusEnum.SAVED:
        return 0
      case StatusEnum.APPLIED:
        return 10
      case StatusEnum.SCREENING:
        return 20 + (event.stage or 1)
      case StatusEnum.INTERVIEW:
        return 40 + (event.stage or 1)
      case StatusEnum.OFFER_RECEIVED:
        return 80
      case StatusEnum.ACCEPTED | StatusEnum.REJECTED | StatusEnum.GHOSTED | StatusEnum.WITHDRAWN:
        return 90
      case StatusEnum.RESCINDED:
        return 100
      case _:
        return 0

  @computed_field
  def timeline(self) -> list[StatusEvent]:
    sorted_events = sorted(self.status_events, key=lambda e: (e.created_at))
    current_status = sorted_events[-1]
    ceiling_priority = self._get_event_priority(current_status)

    history = []
    last_kept_priority = -1

    for event in sorted_events:
      priority = self._get_event_priority(event)

      # Mistake/revereted event, skip
      if priority > ceiling_priority:
        continue

      if priority > last_kept_priority:
        history.append(event)
        last_kept_priority = priority

    if not history or history[-1].id != current_status.id:
      history.append(current_status)

    return history
