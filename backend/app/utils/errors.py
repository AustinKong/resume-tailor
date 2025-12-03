"""Custom exception classes for the application."""


class ApplicationError(Exception):
  """Base exception for all application errors."""

  pass


class NotFoundError(ApplicationError):
  """Raised when a requested resource is not found."""

  pass


class ValidationError(ApplicationError):
  """Raised when input validation fails."""

  pass


class ServiceError(ApplicationError):
  """Raised when a service operation fails."""

  pass


class DuplicateError(ApplicationError):
  """Raised when attempting to create a duplicate resource."""

  pass


class ConfigurationError(ApplicationError):
  """Raised when there's a configuration issue."""

  pass
