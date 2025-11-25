import os
import sqlite3
from contextlib import contextmanager


class DatabaseRepository:
  def __init__(self, **kwargs):
    super().__init__(**kwargs)

    # Configuration
    self.db_path = os.getenv('DB_PATH', 'data/db.sqlite3')

  @contextmanager
  def _db_connection(self):
    conn = sqlite3.connect(self.db_path)
    conn.row_factory = sqlite3.Row
    try:
      yield conn
      conn.commit()
    except Exception:
      conn.rollback()
      raise
    finally:
      conn.close()

  def execute(self, query: str, params: tuple = ()) -> sqlite3.Cursor:
    """
    Execute a query and return cursor.

    Args:
      query: SQL query string.
      params: Query parameters.

    Returns:
      Cursor with results.
    """
    with self._db_connection() as db:
      return db.execute(query, params)

  def execute_many(self, query: str, params_list: list[tuple]) -> None:
    """
    Execute a query with multiple parameter sets.

    Args:
      query: SQL query string.
      params_list: List of parameter tuples.
    """
    with self._db_connection() as db:
      db.executemany(query, params_list)

  def fetch_all(self, query: str, params: tuple = ()) -> list[sqlite3.Row]:
    """
    Fetch all results from a query.

    Args:
      query: SQL query string.
      params: Query parameters.

    Returns:
      List of rows.
    """
    with self._db_connection() as db:
      cursor = db.execute(query, params)
      return cursor.fetchall()

  def fetch_one(self, query: str, params: tuple = ()) -> sqlite3.Row | None:
    """
    Fetch one result from a query.

    Args:
      query: SQL query string.
      params: Query parameters.

    Returns:
      Single row or None.
    """
    with self._db_connection() as db:
      cursor = db.execute(query, params)
      return cursor.fetchone()

  def transaction(self, operations: list[tuple[str, tuple]]) -> None:
    """
    Execute multiple operations in a single transaction.

    Args:
      operations: List of (query, params) tuples.

    Example:
      repo.transaction([
        ("INSERT INTO table1 VALUES (?, ?)", (1, "a")),
        ("INSERT INTO table2 VALUES (?, ?)", (2, "b")),
      ])
    """
    with self._db_connection() as db:
      for query, params in operations:
        db.execute(query, params)
