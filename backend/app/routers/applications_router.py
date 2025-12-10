from typing import Annotated, Literal
from uuid import UUID

from fastapi import APIRouter, Query

from app.schemas import Application, Page, StatusEnum, StatusEvent
from app.services import applications_service

router = APIRouter(
  prefix='/applications',
  tags=['Applications'],
)


@router.get('', response_model=Page[Application])
async def get_applications(
  page: int = 1,
  size: int = 10,
  search: str | None = None,
  status: Annotated[list[StatusEnum] | None, Query()] = None,
  sort_by: Literal['title', 'company', 'posted_at', 'updated_at'] | None = None,
  sort_dir: Literal['asc', 'desc'] | None = None,
):
  print(status)
  applications = applications_service.list_all(page, size, search, status, sort_by, sort_dir)
  return applications


@router.post('/{id}/status-event', response_model=Application)
async def add_status_event(id: UUID, status_event: StatusEvent):
  application = applications_service.get(id)
  application.status_events.append(status_event)
  application = applications_service.update(application)
  return application
