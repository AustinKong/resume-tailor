from rapidfuzz import fuzz


def _normalize_text(text: str) -> str:
  return ' '.join(text.lower().split())


def fuzzy_text_similarity(text1: str, text2: str) -> float:
  """
  Calculate fuzzy similarity between two text strings using Levenshtein distance.

  Args:
    text1: First text string
    text2: Second text string

  Returns:
    Similarity score between 0.0 (completely different) and 1.0 (identical)
  """
  return fuzz.ratio(_normalize_text(text1), _normalize_text(text2)) / 100


def cosine_similarity(vec1: list[float], vec2: list[float]) -> float:
  """
  Calculate cosine similarity between two vectors.

  Args:
    vec1: First vector
    vec2: Second vector

  Returns:
    Similarity score between -1.0 and 1.0 (1.0 = identical direction)
  """
  dot_product = sum(a * b for a, b in zip(vec1, vec2, strict=True))
  magnitude1 = sum(a * a for a in vec1) ** 0.5
  magnitude2 = sum(b * b for b in vec2) ** 0.5

  if magnitude1 == 0 or magnitude2 == 0:
    return 0.0

  return dot_product / (magnitude1 * magnitude2)
