from fastapi import FastAPI
from starlette.middleware.base import BaseHTTPMiddleware

from app.exception_handlers import (
  application_error_exception_handler,
  not_found_exception_handler,
  service_error_exception_handler,
)
from app.middleware import exception_logging_middleware
from app.routers import (
  applications_router,
  config_router,
  experiences_router,
  listings_router,
  profile_router,
  resumes_router,
)
from app.utils.errors import (
  ApplicationError,
  NotFoundError,
  ServiceError,
)


def create_app() -> FastAPI:
  app = FastAPI()

  app.include_router(applications_router, prefix='/api')
  app.include_router(config_router, prefix='/api')
  app.include_router(experiences_router, prefix='/api')
  app.include_router(listings_router, prefix='/api')
  app.include_router(profile_router, prefix='/api')
  app.include_router(resumes_router, prefix='/api')

  app.add_exception_handler(NotFoundError, not_found_exception_handler)
  app.add_exception_handler(ServiceError, service_error_exception_handler)
  app.add_exception_handler(ApplicationError, application_error_exception_handler)

  app.add_middleware(BaseHTTPMiddleware, dispatch=exception_logging_middleware)

  return app
