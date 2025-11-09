import os
from uuid import uuid4

import chromadb
from openai import OpenAI


class VectorRepository:
  def __init__(
    self,
    embedding_model: str = 'text-embedding-3-large',
    **kwargs,
  ):
    super().__init__(**kwargs)

    self.vector_persist_dir = os.getenv('VEC_PATH', 'data/vecs')
    self.embedding_model = embedding_model
    self._chroma_client = None
    self._openai_client = None
    self._collections = {}

  @property
  def chroma_client(self):
    if self._chroma_client is None:
      self._chroma_client = chromadb.PersistentClient(path=self.vector_persist_dir)
    return self._chroma_client

  @property
  def openai_client(self):
    if self._openai_client is None:
      self._openai_client = OpenAI()
    return self._openai_client

  def _get_collection(self, collection_name: str):
    if collection_name not in self._collections:
      self._collections[collection_name] = self.chroma_client.get_or_create_collection(
        name=collection_name
      )
    return self._collections[collection_name]

  def _get_embeddings(self, texts: list[str]) -> list[list[float]]:
    response = self.openai_client.embeddings.create(model=self.embedding_model, input=texts)
    return [item.embedding for item in response.data]

  def add_to_vector_store(
    self, collection_name: str, documents: list[str], metadatas: list[dict] | None = None
  ) -> None:
    """
    Add documents to a vector store collection.

    Args:
      collection_name: Name of the collection.
      documents: List of text strings to add.
      metadatas: Optional list of metadata dicts (one per document).
    """
    if not documents:
      return

    collection = self._get_collection(collection_name)
    embeddings = self._get_embeddings(documents)
    ids = [str(uuid4()) for _ in documents]

    collection.add(documents=documents, embeddings=embeddings, metadatas=metadatas, ids=ids)

  def delete_from_vector_store(self, collection_name: str, where: dict) -> None:
    """
    Delete documents from a collection matching metadata filter.

    Args:
      collection_name: Name of the collection.
      where: Metadata filter dict.
    """
    collection = self._get_collection(collection_name)
    results = collection.get(where=where)
    if results['ids']:
      collection.delete(ids=results['ids'])

  def search_vector_store(
    self, collection_name: str, query: str, k: int = 10
  ) -> list[tuple[str, dict]]:
    """
    Search for similar documents in a collection.

    Args:
      collection_name: Name of the collection.
      query: Search query text.
      k: Number of results to return.

    Returns:
      List of (document_text, metadata) tuples.
    """
    collection = self._get_collection(collection_name)
    query_embedding = self._get_embeddings([query])[0]

    results = collection.query(query_embeddings=[query_embedding], n_results=k)

    documents = []
    for i in range(len(results['ids'][0])):
      doc_text = results['documents'][0][i]
      metadata = results['metadatas'][0][i] or {}
      documents.append((doc_text, metadata))

    return documents

  def search_vector_store_with_score(
    self,
    collection_name: str,
    query: str,
    k: int = 10,
  ) -> list[tuple[str, dict, float]]:
    """
    Search for similar documents with relevance scores.

    Args:
      collection_name: Name of the collection.
      query: Search query text.
      k: Number of results to return.

    Returns:
      List of (document_text, metadata, distance) tuples where distance is lower for more similar.
    """
    collection = self._get_collection(collection_name)
    query_embedding = self._get_embeddings([query])[0]

    results = collection.query(query_embeddings=[query_embedding], n_results=k)

    documents_with_scores = []
    for i in range(len(results['ids'][0])):
      doc_text = results['documents'][0][i]
      metadata = results['metadatas'][0][i] or {}
      distance = results['distances'][0][i]
      documents_with_scores.append((doc_text, metadata, distance))

    return documents_with_scores
