from datetime import UTC, date, datetime
from typing import Annotated, Any

from pydantic import BeforeValidator, PlainSerializer, WithJsonSchema


def _force_utc(v: Any) -> datetime:
  """Ensures datetime is timezone-aware and converted to UTC."""
  if isinstance(v, str):
    try:
      v = datetime.fromisoformat(v)
    except ValueError as e:
      raise ValueError(f'Invalid ISO format datetime string: {v}') from e
  elif not isinstance(v, datetime):
    raise ValueError(f'Expected datetime or ISO string, got {type(v).__name__}: {v}')

  if v.tzinfo is None:
    v = v.replace(tzinfo=UTC)
  return v.astimezone(UTC)


def _serialize_zulu(v: datetime) -> str:
  """Serializes to ISO format ending in 'Z'."""
  return v.isoformat().replace('+00:00', 'Z')


ISODatetime = Annotated[
  datetime,
  BeforeValidator(_force_utc),
  PlainSerializer(_serialize_zulu, return_type=str, when_used='json'),
  WithJsonSchema({'type': 'string', 'format': 'date-time', 'example': '2025-12-08T16:00:00Z'}),
]


ISODate = Annotated[
  date, WithJsonSchema({'type': 'string', 'format': 'date', 'example': '2025-12-08'})
]


def _validate_year_month(v: Any) -> str:
  if not isinstance(v, str):
    raise ValueError('YearMonth must be a string')
  import re

  if not re.match(r'^\d{4}-(0[1-9]|1[0-2])$', v):
    raise ValueError('Invalid format. Expected YYYY-MM')
  return v


ISOYearMonth = Annotated[
  str,
  BeforeValidator(_validate_year_month),
  WithJsonSchema({'type': 'string', 'pattern': '^\\d{4}-(0[1-9]|1[0-2])$', 'example': '2025-12'}),
]
