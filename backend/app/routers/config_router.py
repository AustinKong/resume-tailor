from typing import Any

from fastapi import APIRouter, Body
from pydantic import BaseModel

from app.config import settings
from app.config.schemas import AppConfig

router = APIRouter(prefix='/config', tags=['Config'])



@router.get('')
def get_settings():
  # No need to censor values because the app is fully local
  values = settings.config.model_dump(mode='json')
  schema = AppConfig.model_json_schema()
  defs = schema.get("$defs", {})

  ui_structure = {}


  for category_key, category_meta in schema.get("properties", {}).items():
    ref_path = category_meta.get("$ref", "")
    ref_name = ref_path.split("/")[-1]
    category_def = defs.get(ref_name, {})
    
    category_values = values.get(category_key, {})
    fields_config = {}

    for field_key, field_meta in category_def.get("properties", {}).items():
      fields_config[field_key] = {
        "value": category_values.get(field_key),
        "title": field_meta.get("title", field_key),
        "description": field_meta.get("description", ""),
        "type": field_meta.get("type"),
        "exposure": field_meta.get("exposure", "normal"),
        "minimum": field_meta.get("minimum"),
        "maximum": field_meta.get("maximum"),
        "enum": field_meta.get("enum"),
      }
    
    ui_structure[category_key] = {
      "title": category_meta.get("title", category_key),
      "description": category_meta.get("description", ""),
      "fields": fields_config
    }

  return ui_structure


@router.patch('')
def update_settings(updates: dict[str, Any] = Body(...)):  # noqa: B008
  settings.save(updates)

  return get_settings()
