import json

from chromadb.api.types import Embedding, Metadata
from pydantic import HttpUrl

from app.config import settings
from app.repositories import DatabaseRepository, VectorRepository
from app.schemas import Listing
from app.utils.deduplication import fuzzy_text_similarity


class ListingsService(DatabaseRepository, VectorRepository):
  def __init__(self, **kwargs):
    super().__init__(**kwargs)

  def get_by_urls(self, urls: list[HttpUrl]) -> list[Listing]:
    if not urls:
      return []

    url_strings = [str(url) for url in urls]
    placeholders = ','.join('?' * len(url_strings))
    rows = self.fetch_all(
      f"""
      SELECT 
        l.id, l.url, l.title, l.company, l.domain, l.location, l.description, l.posted_date,
        l.skills, l.requirements
      FROM listings l
      WHERE l.url IN ({placeholders})
      """,
      tuple(url_strings),
    )

    return [Listing(**dict(row)) for row in rows]

  def list_all(self) -> list[Listing]:
    rows = self.fetch_all(
      """
      SELECT 
        l.id, l.url, l.title, l.company, l.domain, l.location, l.description, l.posted_date,
        l.skills, l.requirements
      FROM listings l
      ORDER BY l.posted_date DESC
      """
    )

    return [Listing(**dict(row)) for row in rows]

  def find_similar(
    self,
    new_listing: Listing,
    targets: list[Listing] | None = None,
    # Cache embeddings to avoid recomputation during memory-to-memory comparisons
    cache: dict[str, Embedding] | None = None,
  ) -> Listing | None:
    """
    Find similar listing using BOTH semantic and heuristic methods.
    If targets is provided, compares against those listings instead of the DB.

    Args:
      new_listing: New listing to check for similarities
      targets: Optional list of listings to compare against instead of DB
      cache: Optional cache of embeddings for faster comparison

    Returns:
      Similar listing if a match is found, None otherwise.
    """
    # 1. Check Batch first (Cheaper, contextually relevant)
    if targets:
      match = self._find_best_match(new_listing, targets=targets, cache=cache)
      if match:
        return match

    # 2. Check Database (Global search)
    match = self._find_best_match(new_listing, targets=None, cache=cache)
    if match:
      return match

    return None

  def create(self, listing: Listing) -> Listing:
    self.execute(
      """
      INSERT INTO listings (
        id, url, title, company, domain, location, description, posted_date, skills,
        requirements
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      """,
      (
        str(listing.id),
        str(listing.url),
        listing.title,
        listing.company,
        listing.domain,
        listing.location,
        listing.description,
        listing.posted_date.isoformat() if listing.posted_date else None,
        json.dumps(listing.skills),
        json.dumps(listing.requirements),
      ),
    )

    documents = [self._create_listing_embedding_text(listing)]
    metadatas: list[Metadata] = [{'listing_id': str(listing.id)}]

    self.add_documents(collection_name='listings', documents=documents, metadatas=metadatas)

    return listing

  def _create_listing_embedding_text(self, listing: Listing) -> str:
    parts = [
      f'Company: {listing.company}',
      f'Title: {listing.title}',
      f'Location: {listing.location or "Not specified"}',
      f'Description: {listing.description}',
    ]

    if listing.skills:
      parts.append(f'Skills: {", ".join(listing.skills)}')

    if listing.requirements:
      parts.append(f'Requirements: {", ".join(listing.requirements)}')

    return '\n'.join(parts)

  def _find_best_match(
    self, new_listing: Listing, targets: list[Listing] | None, cache: dict[str, Embedding] | None
  ) -> Listing | None:
    """Internal helper to aggregate semantic and heuristic checks."""
    best_match = None
    best_score = 0.0

    semantic = self._find_semantic_duplicates(new_listing, targets=targets, cache=cache)
    if semantic:
      best_match, best_score = semantic[0]

    heuristic = self._find_heuristic_duplicates(new_listing, targets=targets)
    if heuristic:
      match, score = heuristic[0]
      if score > best_score:
        best_match, best_score = match, score

    if best_match and new_listing.company != best_match.company:
      return None

    return best_match

  def _find_semantic_duplicates(
    self,
    new_listing: Listing,
    targets: list[Listing] | None = None,
    cache: dict[str, Embedding] | None = None,
  ) -> list[tuple[Listing, float]]:
    """
    Find semantically similar listings using vector similarity.
    Either searches the DB or compares against provided targets.

    Args:
      new_listing: The listing to check
      targets: Optional list of listings to compare against instead of DB
      cache: Optional cache of embeddings for faster comparison

    Returns:
      List of (similar_listing, similarity_score) tuples above threshold
    """
    query_text = self._create_listing_embedding_text(new_listing)

    # Compare against provided targets if given
    if targets is not None:
      target_texts = [self._create_listing_embedding_text(t) for t in targets]
      comparison_results = self.compare_documents(query_text, target_texts, cache=cache)

      matches = [
        (targets[i], score)
        for i, (_, score) in enumerate(comparison_results)
        if score >= settings.listings.semantic_threshold
      ]
      return sorted(matches, key=lambda x: x[1], reverse=True)

    # Otherwise search the DB
    search_results = self.search_documents(
      collection_name='listings',
      query=query_text,
      k=settings.listings.search_k,
    )

    matching_ids = []
    similarity_scores = {}
    for _doc_text, metadata, similarity in search_results:
      if similarity >= settings.listings.semantic_threshold:
        listing_id = metadata.get('listing_id')
        if listing_id:
          matching_ids.append(listing_id)
          similarity_scores[listing_id] = similarity

    if not matching_ids:
      return []

    placeholders = ','.join('?' * len(matching_ids))
    rows = self.fetch_all(
      f"""
      SELECT 
        l.id, l.url, l.title, l.company, l.domain, l.location, l.description, l.posted_date,
        l.skills, l.requirements
      FROM listings l
      WHERE l.id IN ({placeholders})
      """,
      tuple(matching_ids),
    )

    similar = []
    for row in rows:
      listing = Listing(**dict(row))
      score = similarity_scores.get(str(listing.id), 0.0)
      similar.append((listing, score))

    return sorted(similar, key=lambda x: x[1], reverse=True)

  def _find_heuristic_duplicates(
    self,
    new_listing: Listing,
    targets: list[Listing] | None = None,
  ) -> list[tuple[Listing, float]]:
    """
    Find duplicates using fuzzy string matching on company and title.
    Searches either the DB or compares against provided targets.

    Args:
      new_listing: The listing to check
      targets: Optional list of listings to compare against instead of DB

    Returns:
      List of (similar_listing, similarity_score) tuples above threshold
    """
    candidates = targets if targets is not None else self.list_all()

    similar = []
    for candidate in candidates:
      title_sim = fuzzy_text_similarity(new_listing.title, candidate.title)
      company_sim = fuzzy_text_similarity(new_listing.company, candidate.company)

      if (
        title_sim >= settings.listings.title_threshold
        and company_sim >= settings.listings.company_threshold
      ):
        combined_score = (title_sim + company_sim) / 2
        similar.append((candidate, combined_score))

    return sorted(similar, key=lambda x: x[1], reverse=True)
