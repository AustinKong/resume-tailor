import json
import os
from typing import TypeVar

from pydantic import BaseModel

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
    """
    filepath = os.path.join(self.data_dir, filename)
    with open(filepath) as f:
      data = json.load(f)
      return model(**data)

  def write_json(self, filename: str, data: BaseModel) -> None:
    """
    Write a Pydantic model to a JSON file.

    Args:
      filename: Name of the JSON file relative to data directory.
      data: Pydantic model instance to serialize.
    """
    filepath = os.path.join(self.data_dir, filename)
    os.makedirs(os.path.dirname(filepath), exist_ok=True)
    with open(filepath, 'w') as f:
      json.dump(data.model_dump(), f, indent=2)
