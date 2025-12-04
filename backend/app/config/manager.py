import functools
import os
import re
import shutil
from pathlib import Path
from typing import Any

import yaml
from dotenv import load_dotenv
from pydantic.utils import deep_update

from app.config.schemas import AppConfig, EnvSettings
from app.utils.errors import ServiceError
from app.utils.structure import assign_path, flatten_structure


class ConfigManager:
  def __init__(self):
    self.defaults_normal_path = Path('config/defaults.normal.yaml')
    self.defaults_advanced_path = Path('config/defaults.advanced.yaml')

    # All non-secret user changes are here
    self.user_overrides_path = Path('config/config.user.yaml')

    self.env_example_path = Path('config/.env.example')
    self.env_path = Path('config/.env')

    self.config: AppConfig | None = None

  def bootstrap(self) -> None:
    try:
      if not self.defaults_normal_path.exists():
        raise ServiceError(f'Missing required core config: {self.defaults_normal_path}')

      if not self.defaults_advanced_path.exists():
        raise ServiceError(f'Missing required core config: {self.defaults_advanced_path}')

      if not self.env_example_path.exists():
        raise ServiceError(f'Missing required config template: {self.env_example_path}')

      if not self.user_overrides_path.exists():
        self.user_overrides_path.parent.mkdir(parents=True, exist_ok=True)
        self.user_overrides_path.touch()
        self.user_overrides_path.write_text('# User overrides go here\n')

      if not self.env_path.exists():
        shutil.copy(self.env_example_path, self.env_path)
    except ServiceError:
      raise
    except Exception as e:
      raise ServiceError(f'Failed to bootstrap config: {str(e)}') from e

  def load(self) -> AppConfig:
    try:
      # Build base config by merging normal + advanced + user overrides
      config_sources = [
        self._read_yaml(self.defaults_normal_path),
        self._read_yaml(self.defaults_advanced_path),
        self._read_yaml(self.user_overrides_path),
      ]
      merged_config = functools.reduce(deep_update, config_sources)

      # Inject secrets from .env
      load_dotenv(self.env_path, override=True)

      if 'env' not in merged_config:
        merged_config['env'] = {}

      required_secrets = EnvSettings.model_fields.keys()

      for field_name in required_secrets:
        env_val = os.getenv(field_name.upper())

        if env_val is not None:
          merged_config['env'][field_name] = env_val

      return AppConfig(**merged_config)
    except ServiceError:
      raise
    except Exception as e:
      raise ServiceError(f'Failed to load configuration: {str(e)}') from e

  def model_dump(self) -> dict[str, Any]:
    if not self.config:
      raise ServiceError('Configuration not loaded')

    return self.config.model_dump(mode='json')

  def save(self, new_partial_config: dict) -> None:
    try:
      exposure_map = self._build_exposure_map(AppConfig)

      yaml_updates = {}
      secret_updates = {}

      # Recursive walker to categorize fields
      def walk(data, path=()):
        for k, v in data.items():
          current_path = path + (k,)
          if isinstance(v, dict):
            walk(v, current_path)
          else:
            exp_type = exposure_map.get(current_path, 'normal')
            if exp_type == 'secret':
              env_var_name = k.upper()
              secret_updates[env_var_name] = str(v)
            else:
              assign_path(yaml_updates, current_path, v)

      walk(new_partial_config)

      # Validate changes before saving
      config_obj = self.load()

      for path, value in flatten_structure(yaml_updates).items():
        assign_path(config_obj, path, value)
      for k, v in secret_updates.items():
        setattr(config_obj.env, k.lower(), v)

      AppConfig.model_validate(config_obj.model_dump())

      if yaml_updates:
        self._write_yaml(self.user_overrides_path, yaml_updates)
      if secret_updates:
        self._write_env(secret_updates, self.env_path)
      self.config = self.load()
    except ServiceError:
      raise
    except Exception as e:
      raise ServiceError(f'Failed to save configuration: {str(e)}') from e

  def _read_yaml(self, path: Path) -> dict:
    try:
      content = yaml.safe_load(path.read_text())
      return content if isinstance(content, dict) else {}
    except yaml.YAMLError as e:
      raise ServiceError(f'Failed to parse YAML file {path}: {str(e)}') from e
    except Exception as e:
      raise ServiceError(f'Failed to read YAML file {path}: {str(e)}') from e

  def _write_yaml(self, path: Path, data: dict):
    try:
      # Merge keys into existing file, not overwrite entirely
      current = self._read_yaml(path)
      updated = deep_update(current, data)
      path.parent.mkdir(parents=True, exist_ok=True)
      path.write_text(yaml.dump(updated, sort_keys=False))
    except ServiceError:
      raise
    except Exception as e:
      raise ServiceError(f'Failed to write YAML file {path}: {str(e)}') from e

  def _write_env(self, updates: dict[str, str], path: Path):
    try:
      content = path.read_text()

      for key, value in updates.items():
        if value is None:
          continue

        # Regex to find "KEY=..." or "KEY = ..."
        pattern = rf'^{key}\s*=.*'
        replacement = f'{key}={value}'

        if re.search(pattern, content, re.MULTILINE):
          content = re.sub(pattern, replacement, content, flags=re.MULTILINE)
        else:
          if content and not content.endswith('\n'):
            content += '\n'
          content += f'{replacement}\n'

      path.write_text(content)
    except Exception as e:
      raise ServiceError(f'Failed to write .env file {path}: {str(e)}') from e

  def _build_exposure_map(self, model, prefix=()):
    """
    Introspects Pydantic models to build a map of { ('path', 'to', 'field'): 'secret' }
    """
    mapping = {}
    for name, field in model.model_fields.items():
      path = prefix + (name,)

      extra = field.json_schema_extra or {}
      exposure = extra.get('exposure', 'normal')

      # Check if nested model
      annotation = field.annotation
      # Handle Optional[Model] or just Model
      if hasattr(annotation, 'model_fields'):
        mapping.update(self._build_exposure_map(annotation, path))
      else:
        mapping[path] = exposure
    return mapping


config_manager = ConfigManager()
