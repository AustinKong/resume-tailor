from typing import Annotated, Literal

from fastapi import APIRouter, Query

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
  status: Annotated[list[StatusEnum] | None, Query()] = None,
  sort_by: Literal['title', 'company', 'posted_at', 'updated_at'] | None = None,
  sort_dir: Literal['asc', 'desc'] | None = None,
):
  print(status)
  applications = applications_service.list_all(page, size, search, status, sort_by, sort_dir)
  return applications
