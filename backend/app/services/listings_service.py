from backend.app.repositories.database_repository import DatabaseRepository
from schemas.listing import Listing


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


_service = ListingsService()

load_listings = _service.load_listings
save_listing = _service.save_listing
