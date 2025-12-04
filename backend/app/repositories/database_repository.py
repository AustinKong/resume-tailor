import sqlite3
from contextlib import contextmanager

from app.config import settings
from app.utils.errors import ServiceError


class DatabaseRepository:
  def __init__(self, **kwargs):
    super().__init__(**kwargs)

  @contextmanager
  def _db_connection(self):
    conn = sqlite3.connect(settings.paths.db_path)
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

    Raises:
      ServiceError: If database operation fails.
    """
    try:
      with self._db_connection() as db:
        return db.execute(query, params)
    except sqlite3.Error as e:
      raise ServiceError(f'Database execute failed: {str(e)}') from e

  def execute_many(self, query: str, params_list: list[tuple]) -> None:
    """
    Execute a query with multiple parameter sets.

    Args:
      query: SQL query string.
      params_list: List of parameter tuples.

    Raises:
      ServiceError: If database operation fails.
    """
    try:
      with self._db_connection() as db:
        db.executemany(query, params_list)
    except sqlite3.Error as e:
      raise ServiceError(f'Database executemany failed: {str(e)}') from e

  def fetch_all(self, query: str, params: tuple = ()) -> list[sqlite3.Row]:
    """
    Fetch all results from a query.

    Args:
      query: SQL query string.
      params: Query parameters.

    Returns:
      List of rows.

    Raises:
      ServiceError: If database operation fails.
    """
    try:
      with self._db_connection() as db:
        cursor = db.execute(query, params)
        return cursor.fetchall()
    except sqlite3.Error as e:
      raise ServiceError(f'Database fetchall failed: {str(e)}') from e

  def fetch_one(self, query: str, params: tuple = ()) -> sqlite3.Row | None:
    """
    Fetch one result from a query.

    Args:
      query: SQL query string.
      params: Query parameters.

    Returns:
      Single row or None.

    Raises:
      ServiceError: If database operation fails.
    """
    try:
      with self._db_connection() as db:
        cursor = db.execute(query, params)
        return cursor.fetchone()
    except sqlite3.Error as e:
      raise ServiceError(f'Database fetchone failed: {str(e)}') from e

  def transaction(self, operations: list[tuple[str, tuple]]) -> None:
    """
    Execute multiple operations in a single transaction.

    Args:
      operations: List of (query, params) tuples.

    Raises:
      ServiceError: If database operation fails.

    Example:
      repo.transaction([
        ("INSERT INTO table1 VALUES (?, ?)", (1, "a")),
        ("INSERT INTO table2 VALUES (?, ?)", (2, "b")),
      ])
    """
    try:
      with self._db_connection() as db:
        for query, params in operations:
          db.execute(query, params)
    except sqlite3.Error as e:
      raise ServiceError(f'Database transaction failed: {str(e)}') from e
