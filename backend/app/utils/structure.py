def deep_merge(base: dict, updates: dict) -> dict:
  """
  Recursively merge updates into base dict, returning a new dict.

  Args:
    base: The base dictionary to merge into.
    updates: The dictionary with updates to apply.

  Returns:
    A new dictionary with updates merged into base.

  Example:
    >>> base = {'a': {'b': 1, 'c': 2}}
    >>> updates = {'a': {'c': 3, 'd': 4}}
    >>> deep_merge(base, updates)
    {'a': {'b': 1, 'c': 3, 'd': 4}}
  """
  result = base.copy()
  for key, value in updates.items():
    if isinstance(value, dict) and isinstance(result.get(key), dict):
      result[key] = deep_merge(result[key], value)
    else:
      result[key] = value
  return result


def assign_path(obj, path, value):
  """
  Assign value to a nested path in a dict or Pydantic model.
  If obj is a dict, path is a tuple of keys.
  If obj is a model, path is a tuple of attribute names.

  Args:
    obj: A dict or Pydantic model to modify.
    path: Tuple of keys/attribute names representing the nested path.
    value: The value to assign at the specified path.

  Returns:
    None. Modifies obj in-place.

  Example:
    With a dict
    >>> d = {}
    >>> assign_path(d, ('config', 'model', 'temperature'), 0.7)
    >>> d
    {'config': {'model': {'temperature': 0.7}}}

    With a Pydantic model
    >>> from pydantic import BaseModel
    >>> class Model(BaseModel):
    ...   nested: dict = {}
    >>> obj = Model()
    >>> assign_path(obj, ('nested', 'key'), 'value')
    >>> obj.nested
    {'key': 'value'}
  """
  for key in path[:-1]:
    if isinstance(obj, dict):
      obj = obj.setdefault(key, {})
    else:
      obj = getattr(obj, key)
  if isinstance(obj, dict):
    obj[path[-1]] = value
  else:
    setattr(obj, path[-1], value)


def flatten_structure(obj, parent=()):
  """
  Recursively flatten a nested dict or Pydantic model into path tuples -> value.
  Works with dicts, Pydantic v2 models, and other objects with model_fields.

  Args:
    obj: A dict, Pydantic model, or other nested structure to flatten.
    parent: Tuple representing the parent path (used internally for recursion).

  Returns:
    Dictionary mapping path tuples to leaf values.
    Example: {('a', 'b', 'c'): 42, ('a', 'b', 'd'): 'value'}

  Example:
    With a nested dict
    >>> config = {'model': {'temperature': 0.7, 'max_tokens': 100}, 'timeout': 30}
    >>> flatten_structure(config)
    {('model', 'temperature'): 0.7, ('model', 'max_tokens'): 100, ('timeout',): 30}

    With a Pydantic model
    >>> from pydantic import BaseModel
    >>> class Inner(BaseModel):
    ...   temperature: float = 0.7
    ...   max_tokens: int = 100
    >>> class Config(BaseModel):
    ...   model: Inner = Inner()
    ...   timeout: int = 30
    >>> config_obj = Config()
    >>> flatten_structure(config_obj)
    {('model', 'temperature'): 0.7, ('model', 'max_tokens'): 100, ('timeout',): 30}
  """
  items = {}
  if isinstance(obj, dict):
    for k, v in obj.items():
      new_key = parent + (k,)
      if isinstance(v, dict) or hasattr(v, 'model_fields'):
        items.update(flatten_structure(v, new_key))
      else:
        items[new_key] = v
  elif hasattr(obj, 'model_fields'):  # Pydantic v2
    for k in obj.model_fields:
      v = getattr(obj, k)
      new_key = parent + (k,)
      if isinstance(v, dict) or hasattr(v, 'model_fields'):
        items.update(flatten_structure(v, new_key))
      else:
        items[new_key] = v
  else:
    # Not traversable, treat as leaf
    items[parent] = obj
  return items
