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
    title='Database Path',
    description='Location where the application stores all job listings, experiences, and user data. Change this if you want to use a different database file.',
    exposure='advanced',
  )
  vector_path: str = ConfigField(
    default_factory=lambda: str(get_data_dir() / 'vectors'),
    title='Vector Database Path',
    description='Directory where AI embeddings for semantic search are stored. Larger datasets require more disk space here.',
    exposure='advanced',
  )
  profile_path: str = ConfigField(
    default_factory=lambda: str(get_data_dir() / 'profile.json'),
    title='Profile Data Path',
    description='File containing your personal information used for resume generation. Edit this file directly to update your profile data.',
    exposure='advanced',
  )
  templates_dir: str = ConfigField(
    default_factory=lambda: str(get_data_dir() / 'resume_templates'),
    title='Resume Templates Directory',
    description='Folder containing HTML templates for resume generation. Add custom templates here to use them in resume creation.',
    exposure='advanced',
  )


class ModelPrefs(BaseModel):
  llm: Literal['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-4', 'gpt-3.5-turbo'] = ConfigField(
    default='gpt-4o-mini',
    title='Language Model',
    description='The AI model used for generating resume content, matching experiences to jobs, and answering questions. More powerful models give better results but cost more.',
    exposure='normal',
  )
  embedding: Literal['text-embedding-3-small', 'text-embedding-3-large', 'text-embedding-ada-002'] = ConfigField(
    default='text-embedding-3-small',
    title='Embedding Model',
    description='Model used to convert text into vectors for semantic search. This affects how well the system finds relevant experiences for job applications.',
    exposure='normal',
  )
  temperature: float = ConfigField(
    default=0.3,
    title='Temperature',
    ge=0.0,
    le=2.0,
    description='Controls randomness in AI responses. Lower values (0.1-0.3) give more focused, consistent results. Higher values (0.7-1.0) add more creativity but may be less reliable.',
    exposure='advanced',
  )
  openai_api_key: str = ConfigField(
    default='',
    title='OpenAI API Key',
    description='Your OpenAI API key for accessing AI models. Required for the application to function. Get one from https://platform.openai.com/api-keys',
    exposure='secret',
  )


class ResumePrefs(BaseModel):
  default_template: str = ConfigField(
    default='template-1.html',
    title='Default Resume Template',
    description='The HTML template used when generating new resumes. Templates are stored in the templates directory and determine the visual layout and styling.',
    exposure='normal',
  )


class ListingsPrefs(BaseModel):
  semantic_threshold: float = ConfigField(
    default=0.90,
    title='Semantic Similarity Threshold',
    ge=0.0,
    le=1.0,
    description='How similar job descriptions must be to be considered duplicates. Higher values (0.9-0.95) are stricter and may miss some duplicates. Lower values (0.7-0.8) catch more duplicates but might be too aggressive.',
    exposure='advanced',
  )
  title_threshold: float = ConfigField(
    default=0.85,
    title='Title Similarity Threshold',
    ge=0.0,
    le=1.0,
    description='How similar job titles must be for basic duplicate detection. This is a faster check before doing full semantic analysis. Values around 0.8-0.9 work well for most cases.',
    exposure='advanced',
  )
  company_threshold: float = ConfigField(
    default=0.90,
    title='Company Similarity Threshold',
    ge=0.0,
    le=1.0,
    description='How similar company names must be to be considered the same. Helps prevent duplicate listings from the same company with slight name variations.',
    exposure='advanced',
  )


class ExperiencesPrefs(BaseModel):
  top_k: int = ConfigField(
    default=3,
    title='Number of Experiences',
    ge=1,
    le=10,
    description='How many relevant work experiences to include in each resume. More experiences provide better context but may make resumes too long. 3-5 is usually optimal.',
    exposure='normal',
  )
  max_bullets: int = ConfigField(
    default=4,
    title='Maximum Bullet Points',
    ge=1,
    le=10,
    description='Maximum number of bullet points to show for each experience section. Limits verbosity while ensuring key achievements are highlighted.',
    exposure='normal',
  )


class IngestionPrefs(BaseModel):
  aggressive: bool = ConfigField(
    default=True,
    title='Aggressive Scraping',
    description='When enabled, uses more aggressive techniques to extract content from websites. May work better on complex sites but could be blocked by anti-bot measures.',
    exposure='advanced',
  )
  headless: bool = ConfigField(
    default=True,
    title='Headless Browser',
    description='Run the web browser without a visible interface. Faster and uses less resources, but disable for debugging scraping issues.',
    exposure='advanced',
  )
  max_length: int = ConfigField(
    default=10000,
    title='Maximum Text Length',
    ge=100,
    le=50000,
    description='Maximum amount of text to extract from each webpage. Larger values capture more content but increase processing time and API costs.',
    exposure='advanced',
  )


class AppConfig(BaseModel):
  paths: PathsPrefs = Field(
    default_factory=PathsPrefs,
    title='File Paths',
    description='File system paths configuration',
  )
  model: ModelPrefs = Field(
    default_factory=ModelPrefs,
    title='AI Models',
    description='LLM and embedding model settings',
  )
  resume: ResumePrefs = Field(
    default_factory=ResumePrefs,
    title='Resume',
    description='Resume configuration',
  )
  listings: ListingsPrefs = Field(
    default_factory=ListingsPrefs,
    title='Job Listings',
    description='Job listings configuration',
  )
  experiences: ExperiencesPrefs = Field(
    default_factory=ExperiencesPrefs,
    title='Work Experience',
    description='Work experience configuration',
  )
  ingestion: IngestionPrefs = Field(
    default_factory=IngestionPrefs,
    title='Web Scraping',
    description='Web ingestion configuration',
  )
