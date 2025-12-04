from typing import Any, Literal

from pydantic import BaseModel, Field


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
    exposure='normal',
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


class EnvSettings(BaseModel):
  openai_api_key: str = ConfigField(
    description='OpenAI API key',
    exposure='secret',
  )


class AppConfig(BaseModel):
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
  env: EnvSettings = Field(
    default_factory=EnvSettings,
    description='Environment settings and secrets',
  )
