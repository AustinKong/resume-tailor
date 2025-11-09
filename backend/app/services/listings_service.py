from pydantic import HttpUrl

from app.repositories.database_repository import DatabaseRepository
from app.schemas.listing import Listing


class ListingsService(DatabaseRepository):
  def __init__(self):
    super().__init__()

  def load_listings(self) -> list[Listing]:
    rows = self.fetch_all(
      """
      SELECT id, title, company, location, posted_date, url
      FROM listings
      ORDER BY posted_date DESC
      """
    )
    return [Listing(**dict(row)) for row in rows]

  def save_listing(self, listing: Listing) -> Listing:
    self.execute(
      """
      INSERT INTO listings (id, title, company, location, posted_date, url)
      VALUES (?, ?, ?, ?, ?, ?)
      """,
      (
        listing.id,
        listing.title,
        listing.company,
        listing.location,
        listing.posted_date,
        str(listing.url),
      ),
    )
    return listing

  def check_existing_urls(self, urls: list[HttpUrl]) -> list[HttpUrl]:
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
check_existing_urls = _service.check_existing_urls
