from app.routers.applications_router import router as applications_router
from app.routers.config_router import router as config_router
from app.routers.experiences_router import router as experiences_router
from app.routers.listings_router import router as listings_router
from app.routers.profile_router import router as profile_router
from app.routers.resumes_router import router as resumes_router

__all__ = [
  'applications_router',
  'config_router',
  'experiences_router',
  'listings_router',
  'profile_router',
  'resumes_router',
]
