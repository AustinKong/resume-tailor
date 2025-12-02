from app.repositories.database_repository import DatabaseRepository
from app.schemas.resume import Resume, ResumeData


class ResumeService(DatabaseRepository):
  def __init__(self, **kwargs):
    super().__init__(**kwargs)

  def create_resume(self, resume: Resume) -> Resume:
    listing = self.fetch_one('SELECT id FROM listings WHERE id = ?', (str(resume.listing_id),))
    if not listing:
      raise ValueError(f'Listing {resume.listing_id} not found')

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

  def update_resume(self, resume: Resume) -> Resume:
    row = self.fetch_one('SELECT * FROM resumes WHERE id = ?', (str(resume.id),))
    if not row:
      raise ValueError(f'Resume {resume.id} not found')

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

  def get_resume_by_id(self, resume_id: str) -> Resume | None:
    row = self.fetch_one('SELECT * FROM resumes WHERE id = ?', (resume_id,))
    if not row:
      return None

    return Resume(
      id=row['id'],
      listing_id=row['listing_id'],
      template=row['template'],
      data=ResumeData.model_validate_json(row['data']),
    )

  def get_resumes_by_listing_id(self, listing_id: str) -> list[Resume]:
    rows = self.fetch_all('SELECT * FROM resumes WHERE listing_id = ?', (listing_id,))

    return [
      Resume(
        id=row['id'],
        listing_id=row['listing_id'],
        template=row['template'],
        data=ResumeData.model_validate_json(row['data']),
      )
      for row in rows
    ]

  def delete_resume(self, resume_id: str) -> bool:
    row = self.fetch_one('SELECT id FROM resumes WHERE id = ?', (resume_id,))
    if not row:
      return False

    self.execute('DELETE FROM resumes WHERE id = ?', (resume_id,))

    return True


_service = ResumeService()

create_resume = _service.create_resume
update_resume = _service.update_resume
get_resume_by_id = _service.get_resume_by_id
get_resumes_by_listing_id = _service.get_resumes_by_listing_id
delete_resume = _service.delete_resume
