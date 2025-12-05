import os
import re
from pathlib import Path

import yaml
from dotenv import load_dotenv

from app.config.schemas import (
  AppConfig,
  ExperiencesPrefs,
  ListingsPrefs,
  ModelPrefs,
  PathsPrefs,
  ResumePrefs,
  ScrapingPrefs,
)
from app.utils.structure import assign_path, deep_merge, flatten_structure


class ConfigManager:
  def __init__(self):
    self.user_config_path = Path('config/config.user.yaml')
    self.env_path = Path('config/.env')
    self._config: AppConfig | None = None
    self._exposure_map: dict | None = None

    self.user_config_path.parent.mkdir(parents=True, exist_ok=True)
    if not self.user_config_path.exists():
      self.user_config_path.touch()
    if not self.env_path.exists():
      self.env_path.touch()

  @property
  def config(self) -> AppConfig:
    if not self._config:
      user_config = deep_merge(self._read_yaml(), self._read_env())
      self._config = AppConfig(**user_config)

    return self._config

  @property
  def exposure_map(self) -> dict:
    if not self._exposure_map:
      mapping = {}
      stack: list[tuple[type, tuple]] = [(AppConfig, ())]

      while stack:
        model, prefix = stack.pop()

        for name, field in model.model_fields.items():
          path = prefix + (name,)
          annotation = field.annotation

          if annotation and hasattr(annotation, 'model_fields'):
            stack.append((annotation, path))
          else:
            extra = field.json_schema_extra
            mapping[path] = extra.get('exposure', 'normal')
      self._exposure_map = mapping

    return self._exposure_map

  @property
  def paths(self) -> PathsPrefs:
    return self.config.paths

  @property
  def model(self) -> ModelPrefs:
    return self.config.model

  @property
  def resume(self) -> ResumePrefs:
    return self.config.resume

  @property
  def listings(self) -> ListingsPrefs:
    return self.config.listings

  @property
  def experiences(self) -> ExperiencesPrefs:
    return self.config.experiences

  @property
  def scraping(self) -> ScrapingPrefs:
    return self.config.scraping

  def save(self, updates: dict) -> None:
    yaml_updates: dict = {}
    env_updates: dict = {}

    for path, value in flatten_structure(updates).items():
      if self.exposure_map.get(path) == 'secret':
        assign_path(env_updates, path, value)
      else:
        assign_path(yaml_updates, path, value)

    current = self.config.model_dump()
    merged = deep_merge(deep_merge(current, yaml_updates), env_updates)
    AppConfig.model_validate(merged)

    if yaml_updates:
      self._write_yaml(yaml_updates)
    if env_updates:
      self._write_env(env_updates)

    self._config = None
    self._exposure_map = None

  def _read_yaml(self) -> dict:
    content = yaml.safe_load(self.user_config_path.read_text())
    return content if isinstance(content, dict) else {}

  def _read_env(self) -> dict:
    load_dotenv(self.env_path, override=True)
    result: dict = {}

    for path, exposure in self.exposure_map.items():
      if exposure != 'secret':
        continue
      env_key = '__'.join(path).upper()
      env_val = os.getenv(env_key)
      if env_val is not None:
        assign_path(result, path, env_val)

    return result

  def _write_yaml(self, updates: dict) -> None:
    current = self._read_yaml()
    merged = deep_merge(current, updates)
    self.user_config_path.write_text(yaml.dump(merged, sort_keys=False))

  def _write_env(self, updates: dict) -> None:
    content = self.env_path.read_text()
    for path, value in flatten_structure(updates).items():
      key = '__'.join(path).upper()
      pattern = rf'^{key}\s*=.*'
      replacement = f'{key}={value}'
      if re.search(pattern, content, re.MULTILINE):
        content = re.sub(pattern, replacement, content, flags=re.MULTILINE)
      else:
        content = content.rstrip('\n') + f'\n{replacement}\n' if content else f'{replacement}\n'
    self.env_path.write_text(content)


settings = ConfigManager()
