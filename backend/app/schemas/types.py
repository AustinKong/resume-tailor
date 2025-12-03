import json
from typing import Annotated, Any

from pydantic import BaseModel, ConfigDict, StringConstraints
from pydantic.alias_generators import to_camel

YearMonth = Annotated[str, StringConstraints(pattern=r'^\d{4}-\d{2}$')]


class CamelModel(BaseModel):
  """Base model with camelCase aliases for JSON serialization."""

  model_config = ConfigDict(
    alias_generator=to_camel,
    populate_by_name=True,
  )


def parse_json_list(v: Any) -> list[str] | None:
  """Parse a JSON string into a list, or return the value if already a list."""
  if isinstance(v, str):
    try:
      return json.loads(v)
    except json.JSONDecodeError:
      return None
  if not v:
    return None
  return v
