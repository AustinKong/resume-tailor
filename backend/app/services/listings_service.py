import os
import sqlite3

from schemas.listing import Listing

DB_PATH = os.getenv('DB_PATH', 'data/database.db')


def load_listings() -> list[Listing]:
  with sqlite3.connect(DB_PATH) as db:
    db.row_factory = sqlite3.Row

    cursor = db.execute(
      """
      SELECT id, title, company, location, posted_date, url
      FROM listings
      ORDER BY posted_date DESC
      """,
    )

    listings = []
    for row in cursor.fetchall():
      listing = dict(row)
      listings.append(Listing(**listing))

    return listings


def save_listing(listing: Listing) -> Listing:
  with sqlite3.connect(DB_PATH) as db:
    db.execute(
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
    db.commit()

  return listing
