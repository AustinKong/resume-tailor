import os
import sys
from pathlib import Path
from typing import Any, Literal

from pydantic import BaseModel, Field


def get_data_dir() -> Path:
  if sys.platform == 'win32':
    # C:\Users\<User>\AppData\Local
    base = Path(os.environ.get('LOCALAPPDATA', os.path.expanduser('~')))
  elif sys.platform == 'darwin':
    # /Users/<User>/Library/Application Support
    base = Path(os.path.expanduser('~/Library/Application Support'))
  else:
    # ~/.local/share
    base = Path(os.path.expanduser('~/.local/share'))

  app_folder = 'Atto'

  if not getattr(sys, 'frozen', False):
    app_folder += '-Dev'

  return base / app_folder


def ConfigField(
  *,
  exposure: Literal['normal', 'advanced', 'secret'] = 'normal',
  **kwargs: Any,
) -> Any:
  """
  Create a configuration field with exposure metadata.
  """
  return Field(
    **kwargs,
    json_schema_extra={'exposure': exposure},
  )


class PathsPrefs(BaseModel):
  db_path: str = ConfigField(
    default_factory=lambda: str(get_data_dir() / 'db.sqlite3'),
    description='Path to SQLite database file',
    exposure='advanced',
  )
  vector_path: str = ConfigField(
    default_factory=lambda: str(get_data_dir() / 'vectors'),
    description='Path to vector database directory',
    exposure='advanced',
  )
  profile_path: str = ConfigField(
    default_factory=lambda: str(get_data_dir() / 'profile.json'),
    description='Path to profile JSON file',
    exposure='advanced',
  )
  templates_dir: str = ConfigField(
    default_factory=lambda: str(get_data_dir() / 'resume_templates'),
    description='Path to resume templates directory',
    exposure='advanced',
  )


class ModelPrefs(BaseModel):
  llm: str = ConfigField(
    default='gpt-4o-mini',
    description='LLM model identifier',
    exposure='normal',
  )
  embedding: str = ConfigField(
    default='text-embedding-3-small',
    description='Embedding model identifier',
    exposure='normal',
  )
  temperature: float = ConfigField(
    default=0.3,
    ge=0.0,
    le=2.0,
    description='LLM temperature for generation',
    exposure='advanced',
  )
  openai_api_key: str = ConfigField(
    default='',
    description='OpenAI API key',
    exposure='secret',
  )


class ResumePrefs(BaseModel):
  default_template: str = ConfigField(
    default='template-1.html',
    description='Default resume template filename',
    exposure='normal',
  )


class ListingsPrefs(BaseModel):
  semantic_threshold: float = ConfigField(
    default=0.90,
    ge=0.0,
    le=1.0,
    description='Semantic similarity threshold for duplicate detection',
    exposure='advanced',
  )
  title_threshold: float = ConfigField(
    default=0.85,
    ge=0.0,
    le=1.0,
    description='Title similarity threshold for heuristic duplicate detection',
    exposure='advanced',
  )
  company_threshold: float = ConfigField(
    default=0.90,
    ge=0.0,
    le=1.0,
    description='Company similarity threshold for heuristic duplicate detection',
    exposure='advanced',
  )
  search_k: int = ConfigField(
    default=5,
    gt=0,
    description='Number of results to return in semantic search',
    exposure='advanced',
  )


class ExperiencesPrefs(BaseModel):
  top_k: int = ConfigField(
    default=3,
    gt=0,
    description='Number of top relevant experiences to return',
    exposure='normal',
  )
  max_bullets: int = ConfigField(
    default=4,
    gt=0,
    description='Maximum bullet points per experience',
    exposure='normal',
  )


class ScrapingPrefs(BaseModel):
  aggressive: bool = ConfigField(
    default=True,
    description='Use aggressive scraping settings',
    exposure='advanced',
  )
  headless: bool = ConfigField(
    default=True,
    description='Run browser in headless mode',
    exposure='advanced',
  )
  max_length: int = ConfigField(
    default=10000,
    gt=0,
    description='Maximum text length to extract per page',
    exposure='advanced',
  )


class AppConfig(BaseModel):
  paths: PathsPrefs = Field(
    default_factory=PathsPrefs,
    description='File system paths configuration',
  )
  model: ModelPrefs = Field(
    default_factory=ModelPrefs,
    description='LLM and embedding model settings',
  )
  resume: ResumePrefs = Field(
    default_factory=ResumePrefs,
    description='Resume configuration',
  )
  listings: ListingsPrefs = Field(
    default_factory=ListingsPrefs,
    description='Job listings configuration',
  )
  experiences: ExperiencesPrefs = Field(
    default_factory=ExperiencesPrefs,
    description='Work experience configuration',
  )
  scraping: ScrapingPrefs = Field(
    default_factory=ScrapingPrefs,
    description='Web scraping configuration',
  )
