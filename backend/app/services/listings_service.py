import json
from pathlib import Path

from chromadb.api.types import Metadata
from pydantic import HttpUrl

from app.config import settings
from app.repositories import DatabaseRepository, FileRepository, VectorRepository
from app.schemas import Listing
from app.utils.deduplication import fuzzy_text_similarity


class ListingsService(DatabaseRepository, VectorRepository, FileRepository):
  def __init__(self, **kwargs):
    super().__init__(**kwargs)

  def stage_snapshot(self, html_content: str, listing_id: str) -> str:
    path = Path(settings.paths.snapshots_dir) / f'{listing_id}.html'
    self.write_text(path, html_content)
    return path.name

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
    new_listings: list[Listing],
  ) -> list[tuple[Listing, Listing]]:
    """
    Find similar listings using BOTH semantic and heuristic methods.

    Args:
      new_listings: New listings to check for similarities

    Returns:
      List of (new_listing, similar_listing) tuples for listings with matches.
    """
    similar_pairs = []

    for new_listing in new_listings:
      best_match = None
      best_score = 0.0

      semantic_matches = self._find_semantic_duplicates(new_listing)
      if semantic_matches:
        match, score = semantic_matches[0]
        if score > best_score:
          best_match = match
          best_score = score

      heuristic_matches = self._find_heuristic_duplicates(new_listing)
      if heuristic_matches:
        match, score = heuristic_matches[0]
        if score > best_score:
          best_match = match
          best_score = score

      if best_match and new_listing.company != best_match.company:
        best_match = None

      if best_match:
        similar_pairs.append((new_listing, best_match))

    return similar_pairs

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

  def _find_semantic_duplicates(
    self,
    new_listing: Listing,
  ) -> list[tuple[Listing, float]]:
    """
    Find semantically similar listings using vector similarity.

    Args:
      new_listing: The listing to check

    Returns:
      List of (similar_listing, similarity_score) tuples above threshold
    """
    query_text = self._create_listing_embedding_text(new_listing)
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
  ) -> list[tuple[Listing, float]]:
    """
    Find duplicates using fuzzy string matching on company and title.

    Args:
      new_listing: The listing to check

    Returns:
      List of (similar_listing, similarity_score) tuples above threshold
    """
    existing_listings = self.list_all()

    similar = []
    for existing_listing in existing_listings:
      title_sim = fuzzy_text_similarity(new_listing.title, existing_listing.title)
      company_sim = fuzzy_text_similarity(new_listing.company, existing_listing.company)

      if (
        title_sim >= settings.listings.title_threshold
        and company_sim >= settings.listings.company_threshold
      ):
        combined_score = (title_sim + company_sim) / 2
        similar.append((existing_listing, combined_score))

    return sorted(similar, key=lambda x: x[1], reverse=True)

  # TODO: Implement delete_orphans() to clean up staged files that were never saved to DB
