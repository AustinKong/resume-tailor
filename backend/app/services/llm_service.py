from typing import TypeVar

from openai import AsyncOpenAI
from pydantic import BaseModel

T = TypeVar('T', bound=BaseModel)


class LLMService:
  def __init__(self):
    self._client = None
    self._cache = {}

  @property
  def client(self):
    if self._client is None:
      self._client = AsyncOpenAI()
    return self._client

  async def call_structured(
    self,
    input: str,
    response_model: type[T],
    temperature: float = 0.7,
    model: str = 'gpt-4o-mini',
  ) -> T:
    """
    Make an LLM API call with structured output.

    Args:
      input: User input string.
      response_model: Pydantic model for structured output (required).
      temperature: Sampling temperature (0.0 - 2.0).
      model: OpenAI model to use.

    Returns:
      Parsed Pydantic model instance.
    """
    response = await self.client.responses.parse(
      model=model, input=input, text_format=response_model, temperature=temperature
    )

    parsed = response.output_parsed
    assert isinstance(parsed, response_model), (
      f'Expected {response_model.__name__}, got {type(parsed).__name__}'
    )
    return parsed

  async def call_unstructured(
    self,
    input: str,
    temperature: float = 0.7,
    model: str = 'gpt-4o-mini',
  ) -> str:
    """
    Make an LLM API call with unstructured text output.

    Args:
      input: User input string.
      temperature: Sampling temperature (0.0 - 2.0).
      model: OpenAI model to use.

    Returns:
      Text response from the model.
    """
    response = await self.client.responses.create(
      model=model,
      input=input,
      temperature=temperature,
    )
    return response.output_text


_service = LLMService()
call_structured = _service.call_structured
call_unstructured = _service.call_unstructured
