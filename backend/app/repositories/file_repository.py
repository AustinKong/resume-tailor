from pathlib import Path

from app.utils.errors import NotFoundError, ServiceError


class FileRepository:
  def _ensure_directory(self, filepath: Path) -> None:
    filepath.parent.mkdir(parents=True, exist_ok=True)

  def read_text(self, filepath: Path) -> str:
    """
    Reads raw text from a file.

    Args:
      filepath: Full path to the file.

    Returns:
      The content of the file as a string.

    Raises:
      NotFoundError: If the file does not exist.
      ServiceError: If reading the file fails.
    """
    if not filepath.exists():
      raise NotFoundError(f'File {filepath} not found')

    try:
      return filepath.read_text(encoding='utf-8')
    except Exception as e:
      raise ServiceError(f'Failed to read file {filepath}: {str(e)}') from e

  def write_text(self, filepath: Path, content: str) -> Path:
    """
    Writes raw text to a file and returns the filepath.

    Args:
      filepath: Full path to the file.
      content: The text content to write.

    Returns:
      The filepath of the written file.

    Raises:
      ServiceError: If writing the file fails.
    """
    try:
      self._ensure_directory(filepath)

      filepath.write_text(content, encoding='utf-8')
      return filepath
    except Exception as e:
      raise ServiceError(f'Failed to write file {filepath}: {str(e)}') from e

  def delete(self, filepath: Path) -> None:
    """
    Deletes a file if it exists.

    Args:
      filepath: Full path to the file.

    Raises:
      ServiceError: If deleting the file fails.
    """
    try:
      if filepath.exists():
        filepath.unlink()
    except Exception as e:
      raise ServiceError(f'Failed to delete file {filepath}: {str(e)}') from e
