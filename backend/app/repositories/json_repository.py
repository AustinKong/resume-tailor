import json
import os
from typing import TypeVar

from pydantic import BaseModel

from app.utils.errors import NotFoundError, ServiceError

T = TypeVar('T', bound=BaseModel)


class JSONRepository:
  def __init__(self, **kwargs):
    super().__init__(**kwargs)
    self.data_dir = os.getenv('DATA_DIR', 'data')

  def read_json(self, filename: str, model: type[T]) -> T:
    """
    Read and parse a JSON file into a Pydantic model.

    Args:
      filename: Name of the JSON file relative to data directory.
      model: Pydantic model class to instantiate.

    Returns:
      Instance of the specified model.

    Raises:
      NotFoundError: If file does not exist.
      ServiceError: If file reading or parsing fails.
    """
    try:
      filepath = os.path.join(self.data_dir, filename)
      with open(filepath) as f:
        data = json.load(f)
        return model(**data)
    except FileNotFoundError as e:
      raise NotFoundError(f'File {filename} not found') from e
    except json.JSONDecodeError as e:
      raise ServiceError(f'Failed to parse JSON file {filename}: {str(e)}') from e
    except Exception as e:
      raise ServiceError(f'Failed to read JSON file {filename}: {str(e)}') from e

  def write_json(self, filename: str, data: BaseModel) -> None:
    """
    Write a Pydantic model to a JSON file.

    Args:
      filename: Name of the JSON file relative to data directory.
      data: Pydantic model instance to serialize.

    Raises:
      ServiceError: If file writing fails.
    """
    try:
      filepath = os.path.join(self.data_dir, filename)
      os.makedirs(os.path.dirname(filepath), exist_ok=True)
      with open(filepath, 'w') as f:
        json.dump(data.model_dump(), f, indent=2)
    except Exception as e:
      raise ServiceError(f'Failed to write JSON file {filename}: {str(e)}') from e
