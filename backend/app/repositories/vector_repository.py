import os

from langchain_chroma import Chroma
from langchain_core.documents import Document
from langchain_openai import OpenAIEmbeddings


class VectorRepository:
  def __init__(
    self,
    vector_persist_dir: str | None = None,
    embedding_model: str = 'text-embedding-3-large',
    **kwargs,
  ):
    super().__init__(**kwargs)

    self.vector_persist_dir = vector_persist_dir or os.getenv('VEC_PATH', 'data/vecs')
    self.embedding_model = embedding_model
    self._vector_stores = {}

  def _get_vector_store(self, collection_name: str) -> Chroma:
    if collection_name not in self._vector_stores:
      self._vector_stores[collection_name] = Chroma(
        collection_name=collection_name,
        embedding_function=OpenAIEmbeddings(model=self.embedding_model),
        persist_directory=self.vector_persist_dir,
      )

    return self._vector_stores[collection_name]

  def add_to_vector_store(self, collection_name: str, documents: list[Document]) -> None:
    """
    Add documents to a vector store collection.

    Args:
      collection_name: Name of the collection.
      documents: List of Document objects to add.
    """
    if documents:
      self._get_vector_store(collection_name).add_documents(documents)

  def delete_from_vector_store(self, collection_name: str, where: dict) -> None:
    """
    Delete documents from a collection matching metadata filter.

    Args:
      collection_name: Name of the collection.
      where: Metadata filter dict.
    """
    store = self._get_vector_store(collection_name)
    existing = store.get(where=where)
    if existing['ids']:
      store.delete(ids=existing['ids'])

  def search_vector_store(self, collection_name: str, query: str, k: int = 10) -> list[Document]:
    """
    Search for similar documents in a collection.

    Args:
      collection_name: Name of the collection.
      query: Search query text.
      k: Number of results to return.

    Returns:
      List of Document objects.
    """
    return self._get_vector_store(collection_name).similarity_search(query, k=k)

  def search_vector_store_with_score(
    self,
    collection_name: str,
    query: str,
    k: int = 10,
  ) -> list[tuple[Document, float]]:
    """
    Search for similar documents with relevance scores.

    Args:
      collection_name: Name of the collection.
      query: Search query text.
      k: Number of results to return.

    Returns:
      List of (Document, score) tuples.
    """
    return self._get_vector_store(collection_name).similarity_search_with_score(query, k=k)
