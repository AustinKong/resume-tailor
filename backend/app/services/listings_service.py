import json

from pydantic import HttpUrl

from app.repositories.database_repository import DatabaseRepository
from app.schemas.listing import Listing


class ListingsService(DatabaseRepository):
  def __init__(self):
    super().__init__()

  def load_listings(self) -> list[Listing]:
    rows = self.fetch_all(
      """
      SELECT id, url, title, company, location, description, posted_date, keywords
      FROM listings
      ORDER BY posted_date DESC
      """
    )

    listings = []
    for row in rows:
      data = dict(row)
      if data.get('keywords'):
        data['keywords'] = json.loads(data['keywords'])
      else:
        data['keywords'] = []
      listings.append(Listing(**data))

    return listings

  def save_listing(self, listing: Listing) -> Listing:
    self.execute(
      """
      INSERT INTO listings (id, url, title, company, location, description, posted_date, keywords)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      """,
      (
        str(listing.id),
        str(listing.url),
        listing.title,
        listing.company,
        listing.location,
        listing.description,
        listing.posted_date.isoformat() if listing.posted_date else None,
        json.dumps(listing.keywords),
      ),
    )
    return listing

  def get_existing_urls(self, urls: list[HttpUrl]) -> list[HttpUrl]:
    """
    Check which URLs already exist in the database. Returns a list of urls that already exist.
    """
    if not urls:
      return []

    url_strings = [str(url) for url in urls]
    placeholders = ','.join('?' * len(url_strings))
    rows = self.fetch_all(
      f"""
      SELECT url
      FROM listings
      WHERE url IN ({placeholders})
      """,
      tuple(url_strings),
    )
    return [HttpUrl(row['url']) for row in rows]


_service = ListingsService()

load_listings = _service.load_listings
save_listing = _service.save_listing
get_existing_urls = _service.get_existing_urls
