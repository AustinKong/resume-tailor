from .applications_service import ApplicationsService
from .experiences_service import ExperiencesService
from .listings_service import ListingsService
from .llm_service import LLMService
from .profile_service import ProfileService
from .resumes_service import ResumesService
from .scraping_service import ScrapingService
from .template_service import TemplateService

applications_service = ApplicationsService()
experience_service = ExperiencesService()
listings_service = ListingsService()
llm_service = LLMService()
profile_service = ProfileService()
resume_service = ResumesService()
scraping_service = ScrapingService()
template_service = TemplateService()

__all__ = [
  'applications_service',
  'experience_service',
  'listings_service',
  'llm_service',
  'profile_service',
  'resume_service',
  'scraping_service',
  'template_service',
]
