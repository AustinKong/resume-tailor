import json
from pathlib import Path
from typing import TypeVar

from pydantic import BaseModel

from app.repositories.file_repository import FileRepository
from app.utils.errors import ServiceError

T = TypeVar('T', bound=BaseModel)


class JSONRepository(FileRepository):
  def __init__(self, **kwargs):
    super().__init__(**kwargs)

  def read_json(self, filepath: Path, model: type[T]) -> T:
    """
    Read and parse a JSON file into a Pydantic model.

    Args:
      filepath: Full path to the JSON file.
      model: Pydantic model class to instantiate.

    Returns:
      Instance of the specified model.

    Raises:
      NotFoundError: If file does not exist.
      ServiceError: If file reading or parsing fails.
    """
    try:
      content = self.read_text(filepath)
      data = json.loads(content)
      return model(**data)
    except json.JSONDecodeError as e:
      raise ServiceError(f'Failed to parse JSON file {filepath}: {str(e)}') from e
    except Exception as e:
      raise ServiceError(f'Failed to read JSON file {filepath}: {str(e)}') from e

  def write_json(self, filepath: Path, data: BaseModel) -> None:
    """
    Write a Pydantic model to a JSON file.

    Args:
      filepath: Full path to the JSON file.
      data: Pydantic model instance to serialize.

    Raises:
      ServiceError: If file writing fails.
    """
    try:
      content = json.dumps(data.model_dump(), indent=2)
      self.write_text(filepath, content)
    except Exception as e:
      raise ServiceError(f'Failed to write JSON file {filepath}: {str(e)}') from e
