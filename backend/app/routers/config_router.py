from typing import Any

from fastapi import APIRouter, Body
from pydantic import BaseModel

from app.config import settings
from app.config.schemas import AppConfig

router = APIRouter(prefix='/config', tags=['Config'])


class SettingsResponse(BaseModel):
  values: dict[str, Any]
  json_schema: dict[str, Any]


@router.get('', response_model=SettingsResponse)
def get_settings():
  values = settings.config.model_dump(mode='json')
  schema = AppConfig.model_json_schema()

  return {'values': values, 'json_schema': schema}


@router.patch('', response_model=SettingsResponse)
def update_settings(updates: dict[str, Any] = Body(...)):  # noqa: B008
  settings.save(updates)

  return get_settings()
