from fastapi import APIRouter

from app.schemas import Application
from app.services import applications_service

router = APIRouter(
  prefix='/applications',
  tags=['Applications'],
)


@router.get('', response_model=list[Application])
async def get_applications():
  applications = applications_service.list_all()
  return applications
