import json
from collections.abc import Callable
from typing import Annotated, Any, TypeVar

from pydantic import BaseModel, ConfigDict, StringConstraints
from pydantic.alias_generators import to_camel

YearMonth = Annotated[str, StringConstraints(pattern=r'^\d{4}-\d{2}$')]

T = TypeVar('T')


class CamelModel(BaseModel):
  """Base model with camelCase aliases for JSON serialization."""

  model_config = ConfigDict(
    alias_generator=to_camel,
    populate_by_name=True,
  )


def parse_json_list_as(converter: Callable[[str], T]) -> Callable[[Any], list[T]]:
  """
  Create a parser that converts JSON array items to a specific type.

  Usage:
    BeforeValidator(parse_json_list_as(UUID))
    BeforeValidator(parse_json_list_as(str))
  """

  def parser(v: Any) -> list[T]:
    if isinstance(v, list):
      if v:
        try:
          return [converter(item) if isinstance(item, str) else item for item in v]
        except (ValueError, TypeError):
          return []
      return []

    if isinstance(v, str):
      try:
        parsed = json.loads(v)
        if not parsed:
          return []
        return [converter(item) for item in parsed]
      except (json.JSONDecodeError, ValueError, TypeError):
        return []

    return []

  return parser
