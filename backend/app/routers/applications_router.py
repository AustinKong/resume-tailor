from typing import Literal

from fastapi import APIRouter

from app.schemas import Application, Page, StatusEnum
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
  status: StatusEnum | None = None,
  sort_by: Literal['title', 'company', 'date', 'last_updated', 'status'] = 'date',
  sort_dir: Literal['asc', 'desc'] = 'desc',
):
  applications = applications_service.list_all(page, size, search, status, sort_by, sort_dir)
  return applications
