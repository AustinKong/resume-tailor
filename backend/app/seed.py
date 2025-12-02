#!/usr/bin/env python3
"""
Script to create the necessary database tables for the resume-tailor backend.
"""

import os
import sqlite3

DB_PATH = os.getenv('DB_PATH', 'data/db.sqlite3')


def create_tables():
  """Create all necessary tables in the SQLite database."""
  os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)

  with sqlite3.connect(DB_PATH) as db:
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
                location TEXT,
                description TEXT NOT NULL,
                posted_date TEXT,
                keywords TEXT
            )
        """)

    db.execute("""
            CREATE TABLE IF NOT EXISTS resumes (
                id TEXT PRIMARY KEY,
                listing_id TEXT NOT NULL,
                template TEXT NOT NULL,
                data JSON NOT NULL,
                FOREIGN KEY (listing_id) REFERENCES listings (id) ON DELETE CASCADE
            )
        """)

    db.commit()

  print(f'Database tables created successfully at {DB_PATH}')


if __name__ == '__main__':
  create_tables()
