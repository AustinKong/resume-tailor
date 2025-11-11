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

  async def call(
    self,
    input: str,
    response_model: type[T] | None = None,
    temperature: float = 0.7,
    model: str = 'gpt-4o-mini',
  ) -> T | str:
    """
    Make an LLM API call with optional structured output.

    Args:
      input: User input string.
      response_model: Optional Pydantic model for structured output.
      temperature: Sampling temperature (0.0 - 2.0).
      model: OpenAI model to use.

    Returns:
      Parsed Pydantic model instance if response_model provided, else string content.
    """
    if response_model is not None:
      response = await self.client.responses.parse(
        model=model, input=input, text_format=response_model, temperature=temperature
      )
      parsed = response.output_parsed
      if parsed is None:
        return response.output_text
      return parsed

    response = await self.client.responses.create(
      model=model,
      input=input,
      temperature=temperature,
    )
    return response.output_text


_service = LLMService()
call = _service.call
