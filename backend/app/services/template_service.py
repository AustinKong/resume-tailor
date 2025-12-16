from pathlib import Path

from jinja2 import Template
from weasyprint import HTML

from app.config import settings
from app.repositories.file_repository import FileRepository
from app.schemas import Profile, Resume
from app.utils.errors import NotFoundError


class TemplateService(FileRepository):
  def __init__(self):
    super().__init__()

  def render(self, template_name: str, profile: Profile, resume: Resume) -> str:
    context = {
      'profile': profile.model_dump(mode='json'),
      'resume': resume.data.model_dump(mode='json'),
    }

    try:
      filepath = Path(settings.paths.templates_dir) / template_name
      template_content = self.read_text(filepath)
      template = Template(template_content)
      return template.render(**context)
    except NotFoundError as e:
      raise NotFoundError(f"Template '{template_name}' not found") from e

  def render_pdf(self, template_name: str, profile: 'Profile', resume: 'Resume') -> bytes:
    html = self.render(template_name, profile, resume)
    base_url = str(Path(settings.paths.templates_dir).resolve())
    try:
      pdf = HTML(string=html, base_url=base_url).write_pdf(
        presentational_hints=True,
        uncompressed_pdf=False,
      )
      if pdf is None:
        raise RuntimeError('WeasyPrint returned no data')
      return pdf
    except Exception as exc:
      raise RuntimeError(f'Failed to render PDF: {exc}') from exc
