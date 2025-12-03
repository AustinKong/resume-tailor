from app.services.experiences_service import ExperiencesService
from app.services.listings_service import ListingsService
from app.services.llm_service import LLMService
from app.services.profile_service import ProfileService
from app.services.resumes_service import ResumesService
from app.services.scraping_service import ScrapingService
from app.services.template_service import TemplateService

experience_service = ExperiencesService()
listings_service = ListingsService()
llm_service = LLMService()
profile_service = ProfileService()
resume_service = ResumesService()
scraping_service = ScrapingService()
template_service = TemplateService()

__all__ = [
  'experience_service',
  'listings_service',
  'llm_service',
  'profile_service',
  'resume_service',
  'scraping_service',
  'template_service',
]
