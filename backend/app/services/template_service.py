from pathlib import Path

from jinja2 import Environment, FileSystemLoader, TemplateNotFound
from weasyprint import HTML

from app.config import settings
from app.schemas import Profile, Resume


class TemplateService:
  def __init__(self):
    self._env = None

  @property
  def templates_dir(self) -> Path:
    path = Path(settings.paths.templates_dir)
    path.mkdir(parents=True, exist_ok=True)
    return path

  @property
  def env(self) -> Environment:
    if self._env is None:
      self._env = Environment(
        loader=FileSystemLoader(str(self.templates_dir)),
        autoescape=True,
        trim_blocks=True,
        lstrip_blocks=True,
      )
    return self._env

  def render(self, template_name: str, profile: Profile, resume: Resume) -> str:
    context = {
      'profile': profile.model_dump(mode='json'),
      'resume': resume.data.model_dump(mode='json'),
    }

    try:
      template = self.env.get_template(template_name)
      return template.render(**context)
    except TemplateNotFound as e:
      raise TemplateNotFound(f"Template '{template_name}' not found") from e

  def render_pdf(self, template_name: str, profile: 'Profile', resume: 'Resume') -> bytes:
    html = self.render(template_name, profile, resume)
    base_url = str(self.templates_dir.resolve())
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
