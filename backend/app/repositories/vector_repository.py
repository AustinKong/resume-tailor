import hashlib
import math
from typing import Any, cast
from uuid import uuid4

import chromadb
from chromadb.api.types import Embedding, Embeddings, Metadata
from openai import OpenAI

from app.config import settings
from app.utils.errors import ServiceError


class VectorRepository:
  def __init__(self, **kwargs):
    super().__init__(**kwargs)

    self._chroma_client = None
    self._embedding_function = None
    self._collection_cache: dict[str, chromadb.Collection] = {}

  @property
  def chroma_client(self):
    if self._chroma_client is None:
      try:
        self._chroma_client = chromadb.PersistentClient(path=settings.paths.vector_path)
      except Exception as e:
        raise ServiceError(f'Failed to initialize ChromaDB client: {str(e)}') from e
    return self._chroma_client

  def _get_hash(self, text: str) -> str:
    return hashlib.sha256(text.encode('utf-8')).hexdigest()

  def _normalize(self, v: Embedding) -> Embedding:
    norm = math.sqrt(sum(x * x for x in v))
    return cast(Embedding, [x / norm for x in v]) if norm > 0 else v

  def _get_collection(self, collection_name: str) -> chromadb.Collection:
    if collection_name not in self._collection_cache:
      try:
        self._collection_cache[collection_name] = self.chroma_client.get_or_create_collection(
          name=collection_name,
          metadata={'hnsw:space': 'cosine'},
        )
      except Exception as e:
        raise ServiceError(f'Failed to get or create collection {collection_name}: {str(e)}') from e
    return self._collection_cache[collection_name]

  def get_embeddings(
    self, texts: list[str], cache: dict[str, Embedding] | None = None
  ) -> Embeddings:
    """
    Generate embeddings for a list of text strings using OpenAI's embedding model.

    Uses caching to avoid recomputing embeddings for previously seen texts.
    Embeddings are normalized for consistent similarity calculations.

    Args:
      texts: List of text strings to embed.

    Returns:
      List of embedding vectors, one for each input text.
    """
    if not texts:
      return cast(Embeddings, [])

    results: list[Embedding | None] = [None] * len(texts)
    to_fetch = []
    to_fetch_indices = []

    for i, text in enumerate(texts):
      h = self._get_hash(text)
      if cache is not None and h in cache:
        results[i] = cast(Embedding, cache[h])
      else:
        to_fetch.append(text)
        to_fetch_indices.append(i)

    if to_fetch:
      client = OpenAI(api_key=settings.model.openai_api_key)
      response = client.embeddings.create(input=to_fetch, model=settings.model.embedding)

      # BUG FIX: Extract the list of floats from OpenAI response objects
      for i, item in zip(to_fetch_indices, response.data, strict=True):
        # Ensure vectors are normalized so they work irrespective of embedding function
        normalized = self._normalize(cast(Embedding, item.embedding))
        h = self._get_hash(texts[i])
        if cache is not None:
          cache[h] = normalized
        results[i] = normalized

    return cast(Embeddings, results)

  def add_documents(
    self,
    collection_name: str,
    documents: list[str],
    metadatas: list[Metadata] | None = None,
  ) -> None:
    """
    Add documents to a collection. Embeddings are automatically generated.

    Args:
      collection_name: Name of the collection.
      documents: List of text strings to add.
      metadatas: Optional list of metadata dicts (one per document).
        Each metadata dict can contain str, int, float, bool, or None values.
    """
    if not documents:
      return

    try:
      collection = self._get_collection(collection_name)
      ids = [str(uuid4()) for _ in documents]

      embeddings = self.get_embeddings(documents)

      collection.add(
        documents=documents,
        embeddings=embeddings,
        metadatas=metadatas,
        ids=ids,
      )
    except ServiceError:
      raise
    except Exception as e:
      msg = f'Failed to add documents to {collection_name}: {str(e)}'
      raise ServiceError(msg) from e

  def get_documents(
    self, collection_name: str, where: dict[str, Any] | None = None
  ) -> list[tuple[str, dict[str, Any]]]:
    """
    Get all documents and metadata from a collection.

    Args:
      collection_name: Name of the collection.
      where: Optional metadata filter dict.

    Returns:
      List of (document_text, metadata) tuples.
    """
    try:
      collection = self._get_collection(collection_name)
      results = collection.get(where=where)

      documents: list[tuple[str, dict[str, Any]]] = []
      ids = results.get('ids', [])
      docs = results.get('documents') or []
      metas = results.get('metadatas') or []

      for i in range(len(ids)):
        doc_text = docs[i] if i < len(docs) else ''
        metadata = metas[i] if i < len(metas) else {}
        documents.append((str(doc_text), dict(metadata or {})))

      return documents
    except ServiceError:
      raise
    except Exception as e:
      raise ServiceError(f'Failed to get documents from {collection_name}: {str(e)}') from e

  def delete_documents(self, collection_name: str, where: dict[str, Any]) -> None:
    """
    Delete documents from a collection matching metadata filter.

    Args:
      collection_name: Name of the collection.
      where: Metadata filter dict.
    """
    try:
      collection = self._get_collection(collection_name)
      results = collection.get(where=where)
      ids = results.get('ids', [])
      if ids:
        collection.delete(ids=ids)
    except ServiceError:
      raise
    except Exception as e:
      raise ServiceError(f'Failed to delete documents from {collection_name}: {str(e)}') from e

  def search_documents(
    self, collection_name: str, query: str, k: int = 10, cache: dict[str, Embedding] | None = None
  ) -> list[tuple[str, dict[str, Any], float]]:
    """
    Search for similar documents in a collection.

    Args:
      collection_name: Name of the collection.
      query: Search query text.
      k: Number of results to return.

    Returns:
      List of (document_text, metadata, similarity_score) tuples.
      Similarity score is 0-1, where higher means more similar.
    """
    try:
      collection = self._get_collection(collection_name)

      query_vector = self.get_embeddings([query], cache=cache)[0]
      results = collection.query(query_embeddings=[query_vector], n_results=k)

      documents: list[tuple[str, dict[str, Any], float]] = []

      result_ids = cast(list[list[str]], results.get('ids') or [[]])[0]
      result_docs = cast(list[list[str]], results.get('documents') or [[]])[0]
      result_metas = cast(list[list[dict[str, Any]]], results.get('metadatas') or [[]])[0]
      result_distances = cast(list[list[float]], results.get('distances') or [[]])[0]

      for i in range(len(result_ids)):
        doc_text = result_docs[i] if i < len(result_docs) else ''
        metadata = result_metas[i] if i < len(result_metas) else {}
        distance = result_distances[i] if i < len(result_distances) else 1.0

        # Convert cosine distance to similarity (0-1, higher is more similar)
        # ChromaDB returns cosine distance (0-2), we convert to similarity: 1 - distance
        similarity = 1 - distance

        documents.append((str(doc_text), dict(metadata or {}), float(similarity)))

      return documents
    except ServiceError:
      raise
    except Exception as e:
      raise ServiceError(f'Failed to search documents in {collection_name}: {str(e)}') from e

  def compare_documents(
    self, source_doc: str, target_docs: list[str], cache: dict[str, Embedding] | None = None
  ) -> list[tuple[str, float]]:
    """
    Compare a source document with multiple target documents using cosine similarity.

    Args:
      source_doc: The source document text to compare against.
      target_docs: List of target document texts to compare with the source.

    Returns:
      List of (document_text, similarity_score) tuples, where similarity_score
      is a float between 0 and 1 (higher means more similar).
    """
    source_emb = self.get_embeddings([source_doc], cache=cache)[0]
    target_embs = self.get_embeddings(target_docs, cache=cache)

    results = []
    for doc, emb in zip(target_docs, target_embs, strict=True):
      # Perform cosine similarity. Since vectors are normalized, this is just the dot product.
      dot_product = sum(s * t for s, t in zip(source_emb, emb, strict=True))
      similarity = dot_product
      results.append((doc, similarity))

    return results
