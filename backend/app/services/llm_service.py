from collections.abc import Iterable
from typing import TypeVar

from openai import OpenAI
from openai.types.chat import ChatCompletionMessageParam
from pydantic import BaseModel

T = TypeVar('T', bound=BaseModel)


class LLMService:
  def __init__(self):
    self._client = None
    self._cache = {}

  @property
  def client(self):
    if self._client is None:
      self._client = OpenAI()
    return self._client

  def call(
    self,
    messages: Iterable[ChatCompletionMessageParam],
    response_model: type[T] | None = None,
    temperature: float = 0.7,
    model: str = 'gpt-4o-mini',
  ) -> T | str:
    """
    Make an LLM API call with optional structured output.

    Args:
      messages: List of message dicts with 'role' and 'content'.
      response_model: Optional Pydantic model for structured output.
      temperature: Sampling temperature (0.0 - 2.0).
      model: OpenAI model to use.

    Returns:
      Parsed Pydantic model instance if response_model provided, else string content.
    """
    if response_model is not None:
      completion = self.client.beta.chat.completions.parse(
        model=model, messages=messages, response_format=response_model, temperature=temperature
      )
      return completion.choices[0].message.parsed  # type: ignore

    completion = self.client.chat.completions.create(
      model=model, messages=messages, temperature=temperature
    )
    return completion.choices[0].message.content or ''


_service = LLMService()
llm_call = _service.call
