import os
import sqlite3

from app.config import settings


def create_tables():
  os.makedirs(os.path.dirname(settings.paths.db_path), exist_ok=True)

  with sqlite3.connect(settings.paths.db_path) as db:
    db.execute("""
      CREATE TABLE IF NOT EXISTS experiences (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        organization TEXT NOT NULL,
        type TEXT NOT NULL,
        location TEXT,
        start_date TEXT NOT NULL,
        end_date TEXT
      )
    """)

    db.execute("""
      CREATE TABLE IF NOT EXISTS experience_bullets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        experience_id TEXT NOT NULL,
        text TEXT NOT NULL,
        FOREIGN KEY (experience_id) REFERENCES experiences (id) ON DELETE CASCADE
      )
    """)

    db.execute("""
      CREATE TABLE IF NOT EXISTS listings (
        id TEXT PRIMARY KEY,
        url TEXT NOT NULL UNIQUE,
        title TEXT NOT NULL,
        company TEXT NOT NULL,
        domain TEXT NOT NULL,
        location TEXT,
        description TEXT NOT NULL,
        posted_date TEXT,
        skills TEXT,
        requirements TEXT
      )
    """)

    db.execute("""
      CREATE TABLE IF NOT EXISTS resumes (
        id TEXT PRIMARY KEY,
        application_id TEXT NOT NULL,
        template TEXT NOT NULL,
        data JSON NOT NULL,
        FOREIGN KEY (application_id) REFERENCES applications (id) ON DELETE CASCADE
      )
    """)

    db.execute("""
      CREATE TABLE IF NOT EXISTS applications (
        id TEXT PRIMARY KEY,
        listing_id TEXT NOT NULL UNIQUE,
        resume_id TEXT,
        FOREIGN KEY (listing_id) REFERENCES listings (id) ON DELETE CASCADE,
        FOREIGN KEY (resume_id) REFERENCES resumes (id) ON DELETE SET NULL
      )
    """)

    db.execute("""
      CREATE TABLE IF NOT EXISTS status_events (
        id TEXT PRIMARY KEY,
        application_id TEXT NOT NULL,
        status TEXT NOT NULL,
        stage INTEGER NOT NULL,
        date TEXT NOT NULL,
        notes TEXT,
        FOREIGN KEY (application_id) REFERENCES applications (id) ON DELETE CASCADE
      )
    """)

    db.commit()

  print(f'Database tables created successfully at {settings.paths.db_path}')


if __name__ == '__main__':
  create_tables()
