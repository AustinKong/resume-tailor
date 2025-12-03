from uuid import UUID

from app.repositories import DatabaseRepository
from app.schemas import Resume, ResumeData
from app.utils.errors import NotFoundError


class ResumesService(DatabaseRepository):
  def __init__(self, **kwargs):
    super().__init__(**kwargs)

  def get(self, resume_id: UUID) -> Resume:
    row = self.fetch_one('SELECT * FROM resumes WHERE id = ?', (str(resume_id),))
    if not row:
      raise NotFoundError(f'Resume {resume_id} not found')

    return Resume(
      id=row['id'],
      listing_id=row['listing_id'],
      template=row['template'],
      data=ResumeData.model_validate_json(row['data']),
    )

  def create(self, resume: Resume) -> Resume:
    listing = self.fetch_one('SELECT id FROM listings WHERE id = ?', (str(resume.listing_id),))
    if not listing:
      raise NotFoundError(f'Listing {resume.listing_id} not found')

    self.execute(
      'INSERT INTO resumes (id, listing_id, template, data) VALUES (?, ?, ?, ?)',
      (
        str(resume.id),
        str(resume.listing_id),
        resume.template,
        resume.data.model_dump_json(),
      ),
    )

    return resume

  def update(self, resume: Resume) -> Resume:
    row = self.fetch_one('SELECT * FROM resumes WHERE id = ?', (str(resume.id),))
    if not row:
      raise NotFoundError(f'Resume {resume.id} not found')

    self.execute(
      'UPDATE resumes SET listing_id = ?, template = ?, data = ? WHERE id = ?',
      (
        str(resume.listing_id),
        resume.template,
        resume.data.model_dump_json(),
        str(resume.id),
      ),
    )

    return resume

  def delete(self, resume_id: UUID) -> None:
    row = self.fetch_one('SELECT id FROM resumes WHERE id = ?', (str(resume_id),))
    if not row:
      raise NotFoundError(f'Resume {resume_id} not found')

    self.execute('DELETE FROM resumes WHERE id = ?', (str(resume_id),))
