from typing import TypeVar

from openai import AsyncOpenAI
from pydantic import BaseModel

from app.config import settings

T = TypeVar('T', bound=BaseModel)


class LLMService:
  def __init__(self):
    self._client = None

  @property
  def client(self):
    if self._client is None:
      self._client = AsyncOpenAI(api_key=settings.model.openai_api_key)
    return self._client

  async def call_structured(
    self,
    input: str,
    response_model: type[T],
  ) -> T:
    """
    Make an LLM API call with structured output.

    Args:
      input: User input string.
      response_model: Pydantic model for structured output (required).

    Returns:
      Parsed Pydantic model instance.
    """
    response = await self.client.responses.parse(
      model=settings.model.llm,
      input=input,
      temperature=settings.model.temperature,
      text_format=response_model,
    )

    parsed = response.output_parsed
    assert isinstance(parsed, response_model), (
      f'Expected {response_model.__name__}, got {type(parsed).__name__}'
    )
    return parsed

  async def call_unstructured(
    self,
    input: str,
  ) -> str:
    """
    Make an LLM API call with unstructured text output.

    Args:
      input: User input string.

    Returns:
      Text response from the model.
    """
    response = await self.client.responses.create(
      model=settings.model.llm,
      input=input,
      temperature=settings.model.temperature,
    )
    return response.output_text
