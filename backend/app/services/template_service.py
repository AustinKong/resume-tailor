import os
from pathlib import Path

from jinja2 import Environment, FileSystemLoader, TemplateNotFound

from app.schemas.profile import Profile
from app.schemas.resume import Resume


class TemplateService:
  def __init__(self):
    self.templates_dir = Path(os.getenv('TEMPLATES_DIR', 'data/templates'))

    self.templates_dir.mkdir(parents=True, exist_ok=True)

    self.env = Environment(
      loader=FileSystemLoader(str(self.templates_dir)),
      autoescape=True,
      trim_blocks=True,
      lstrip_blocks=True,
    )

  def render(self, template_name: str, profile: Profile, resume: Resume) -> str:
    """
    Render a template with the given profile and resume.

    Args:
      template_name: Name of the template file (e.g., 'template-1.html')
      profile: Profile object containing personal information
      resume: Resume object containing resume data and sections

    Returns:
      Rendered HTML string

    Raises:
      TemplateNotFound: If the template file doesn't exist
    """
    context = {
      'profile': profile.model_dump(mode='json'),
      'resume': resume.data.model_dump(mode='json'),
    }

    try:
      template = self.env.get_template(template_name)
      return template.render(**context)
    except TemplateNotFound as e:
      raise TemplateNotFound(f"Template '{template_name}' not found in {self.templates_dir}") from e

  def list_templates(self) -> list[str]:
    """
    List all available template files in the templates directory.

    Returns:
      List of template filenames
    """
    if not self.templates_dir.exists():
      return []

    return [
      str(file.relative_to(self.templates_dir))
      for file in self.templates_dir.rglob('*')
      if file.is_file()
    ]

  def template_exists(self, template_name: str) -> bool:
    """
    Check if a template exists.

    Args:
      template_name: Name of the template file

    Returns:
      True if template exists, False otherwise
    """
    template_path = self.templates_dir / template_name
    return template_path.exists() and template_path.is_file()

  def get_template_source(self, template_name: str) -> str:
    """
    Get the raw source code of a template.

    Args:
      template_name: Name of the template file

    Returns:
      Template source code as string

    Raises:
      TemplateNotFound: If the template doesn't exist
    """
    template_path = self.templates_dir / template_name
    if not template_path.exists():
      raise TemplateNotFound(f"Template '{template_name}' not found in {self.templates_dir}")

    return template_path.read_text(encoding='utf-8')


_service = TemplateService()

render = _service.render
list_templates = _service.list_templates
template_exists = _service.template_exists
get_template_source = _service.get_template_source
