from typing import Annotated, Literal
from uuid import UUID

from fastapi import APIRouter, Query

from app.schemas import Application, Page, StatusEnum, StatusEvent
from app.services import applications_service

router = APIRouter(
  prefix='/applications',
  tags=['Applications'],
)



@router.get('/{id}', response_model=Application)
async def get_application(id: UUID):
  application = applications_service.get(id)
  return application


@router.post('/{id}/status-event', response_model=Application)
async def add_status_event(id: UUID, status_event: StatusEvent):
  application = applications_service.get(id)
  application.status_events.append(status_event)
  application = applications_service.update(application)
  return application
