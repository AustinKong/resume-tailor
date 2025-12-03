import json
from uuid import UUID

from chromadb.api.types import Metadata
from pydantic import HttpUrl

from app.repositories import DatabaseRepository, VectorRepository
from app.schemas import Listing
from app.utils.deduplication import fuzzy_text_similarity
from app.utils.errors import NotFoundError


def _parse_resume_ids(resume_ids_str: str) -> list[UUID]:
  """Convert comma-separated resume ID string to list of UUIDs."""
  if not resume_ids_str:
    return []
  result = []
  for id_str in resume_ids_str.split(','):
    try:
      result.append(UUID(id_str.strip()))
    except ValueError:
      continue
  return result


class ListingsService(DatabaseRepository, VectorRepository):
  def __init__(self, **kwargs):
    super().__init__(**kwargs)
    self.semantic_similarity_threshold = 0.90
    self.title_similarity_threshold = 0.85
    self.company_similarity_threshold = 0.90

  def load_listings(self) -> list[Listing]:
    rows = self.fetch_all(
      """
      SELECT 
        l.id, l.url, l.title, l.company, l.location, l.description, l.posted_date,
        l.skills, l.requirements,
        COALESCE(
          GROUP_CONCAT(r.id),
          ''
        ) as resume_ids
      FROM listings l
      LEFT JOIN resumes r ON l.id = r.listing_id
      GROUP BY l.id
      ORDER BY l.posted_date DESC
      """
    )

    return [
      Listing(**{**dict(row), 'resume_ids': _parse_resume_ids(row['resume_ids'])}) for row in rows
    ]

  def save_listings(self, listings: list[Listing]) -> list[Listing]:
    if not listings:
      return []

    self.execute_many(
      """
      INSERT INTO listings (
        id, url, title, company, location, description, posted_date, skills,
        requirements
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      """,
      [
        (
          str(listing.id),
          str(listing.url),
          listing.title,
          listing.company,
          listing.location,
          listing.description,
          listing.posted_date.isoformat() if listing.posted_date else None,
          json.dumps(listing.skills),
          json.dumps(listing.requirements),
        )
        for listing in listings
      ],
    )

    documents = [self._create_listing_embedding_text(listing) for listing in listings]
    metadatas: list[Metadata] = [
      {
        'listing_id': str(listing.id),
        'url': str(listing.url),
        'title': listing.title,
        'company': listing.company,
      }
      for listing in listings
    ]

    self.add_documents(collection_name='listings', documents=documents, metadatas=metadatas)

    return listings

  def get_listings_by_urls(self, urls: list[HttpUrl]) -> list[Listing]:
    if not urls:
      return []

    url_strings = [str(url) for url in urls]
    placeholders = ','.join('?' * len(url_strings))
    rows = self.fetch_all(
      f"""
      SELECT 
        l.id, l.url, l.title, l.company, l.location, l.description, l.posted_date,
        l.skills, l.requirements,
        COALESCE(
          GROUP_CONCAT(r.id),
          ''
        ) as resume_ids
      FROM listings l
      LEFT JOIN resumes r ON l.id = r.listing_id
      WHERE l.url IN ({placeholders})
      GROUP BY l.id
      """,
      tuple(url_strings),
    )

    return [
      Listing(**{**dict(row), 'resume_ids': _parse_resume_ids(row['resume_ids'])}) for row in rows
    ]

  def get_listing_by_id(self, listing_id: str) -> Listing:
    row = self.fetch_one(
      """
      SELECT 
        l.id, l.url, l.title, l.company, l.location, l.description, l.posted_date,
        l.skills, l.requirements,
        COALESCE(
          GROUP_CONCAT(r.id),
          ''
        ) as resume_ids
      FROM listings l
      LEFT JOIN resumes r ON l.id = r.listing_id
      WHERE l.id = ?
      GROUP BY l.id
      """,
      (listing_id,),
    )

    if not row:
      raise NotFoundError(f'Listing {listing_id} not found')

    return Listing(**{**dict(row), 'resume_ids': _parse_resume_ids(row['resume_ids'])})

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
    similarity_threshold: float = 0.90,
    k: int = 5,
  ) -> list[tuple[Listing, float]]:
    """
    Find semantically similar listings using vector similarity.

    Args:
      new_listing: The listing to check
      similarity_threshold: Minimum cosine similarity (0-1, default 0.90)
      k: Number of similar results to retrieve

    Returns:
      List of (similar_listing, similarity_score) tuples above threshold
    """
    query_text = self._create_listing_embedding_text(new_listing)
    search_results = self.search_documents(collection_name='listings', query=query_text, k=k)

    matching_ids = []
    similarity_scores = {}
    for _doc_text, metadata, similarity in search_results:
      if similarity >= similarity_threshold:
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
        l.id, l.url, l.title, l.company, l.location, l.description, l.posted_date,
        l.skills, l.requirements,
        COALESCE(
          GROUP_CONCAT(r.id),
          ''
        ) as resume_ids
      FROM listings l
      LEFT JOIN resumes r ON l.id = r.listing_id
      WHERE l.id IN ({placeholders})
      GROUP BY l.id
      """,
      tuple(matching_ids),
    )

    similar = []
    for row in rows:
      listing = Listing(**{**dict(row), 'resume_ids': _parse_resume_ids(row['resume_ids'])})
      score = similarity_scores.get(str(listing.id), 0.0)
      similar.append((listing, score))

    return sorted(similar, key=lambda x: x[1], reverse=True)

  def _find_heuristic_duplicates(
    self,
    new_listing: Listing,
    title_threshold: float = 0.85,
    company_threshold: float = 0.90,
  ) -> list[tuple[Listing, float]]:
    """
    Find duplicates using fuzzy string matching on company and title.

    Args:
      new_listing: The listing to check
      title_threshold: Minimum title similarity (0-1, default 0.85)
      company_threshold: Minimum company similarity (0-1, default 0.90)

    Returns:
      List of (similar_listing, similarity_score) tuples above threshold
    """
    existing_listings = self.load_listings()

    similar = []
    for existing_listing in existing_listings:
      title_sim = fuzzy_text_similarity(new_listing.title, existing_listing.title)
      company_sim = fuzzy_text_similarity(new_listing.company, existing_listing.company)

      if title_sim >= title_threshold and company_sim >= company_threshold:
        combined_score = (title_sim + company_sim) / 2
        similar.append((existing_listing, combined_score))

    return sorted(similar, key=lambda x: x[1], reverse=True)

  def find_similar_listings(
    self,
    new_listings: list[Listing],
    semantic_threshold: float = 0.90,
    heuristic_title_threshold: float = 0.85,
    heuristic_company_threshold: float = 0.90,
  ) -> list[tuple[Listing, Listing]]:
    """
    Find similar listings using BOTH semantic and heuristic methods.

    Args:
      new_listings: New listings to check for similarities
      semantic_threshold: Minimum cosine similarity for semantic (0-1, default 0.90)
      heuristic_title_threshold: Minimum title similarity for heuristic (0-1, default 0.85)
      heuristic_company_threshold: Minimum company similarity (0-1, default 0.90)

    Returns:
      List of (new_listing, similar_listing) tuples for listings with matches.
    """
    similar_pairs = []

    for new_listing in new_listings:
      best_match = None
      best_score = 0.0

      semantic_matches = self._find_semantic_duplicates(
        new_listing, similarity_threshold=semantic_threshold
      )
      if semantic_matches:
        match, score = semantic_matches[0]
        if score > best_score:
          best_match = match
          best_score = score

      heuristic_matches = self._find_heuristic_duplicates(
        new_listing,
        title_threshold=heuristic_title_threshold,
        company_threshold=heuristic_company_threshold,
      )
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
