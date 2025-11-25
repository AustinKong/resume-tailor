from uuid import UUID

from app.repositories.database_repository import DatabaseRepository
from app.repositories.vector_repository import VectorRepository
from app.schemas.experience import Experience


class ExperienceService(DatabaseRepository, VectorRepository):
  def __init__(self):
    super().__init__()

  def save_experience(self, experience: Experience) -> Experience:
    self.execute(
      """
      INSERT INTO experiences (id, title, organization, type, location, start_date, end_date)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      """,
      (
        str(experience.id),
        experience.title,
        experience.organization,
        experience.type.value,
        experience.location,
        experience.start_date,
        experience.end_date if experience.end_date else None,
      ),
    )

    documents = []
    metadatas = []
    bullets = []

    for i, bullet_text in enumerate(experience.bullets):
      bullets.append((str(experience.id), bullet_text))

      context_aware_text = (
        f'Role: {experience.title}\n'
        f'Organization: {experience.organization}\n'
        f'Type: {experience.type.value}\n'
        f'Achievement: {bullet_text}\n'
      )

      documents.append(context_aware_text)
      metadatas.append({'experience_id': str(experience.id), 'bullet_index': i})

    if bullets:
      self.execute_many(
        """
        INSERT INTO experience_bullets (experience_id, text)
        VALUES (?, ?)
        """,
        bullets,
      )

    if documents:
      self.add_documents('experience_bullets', documents, metadatas)

    return experience

  def load_experiences(self) -> list[Experience]:
    rows = self.fetch_all(
      """
      SELECT id, title, organization, type, location, start_date, end_date
      FROM experiences
      ORDER BY start_date DESC
      """
    )

    experiences = []
    for row in rows:
      exp_id = row['id']

      bullet_rows = self.fetch_all(
        """
        SELECT text
        FROM experience_bullets
        WHERE experience_id = ?
        ORDER BY id ASC
        """,
        (exp_id,),
      )
      bullets = [r['text'] for r in bullet_rows]

      experience = dict(row)
      experience['bullets'] = bullets

      experiences.append(Experience(**experience))

    return experiences

  def load_experience(self, id: UUID) -> Experience:
    row = self.fetch_one(
      """
      SELECT id, title, organization, type, location, start_date, end_date
      FROM experiences
      WHERE id = ?
      """,
      (str(id),),
    )
    if not row:
      raise ValueError(f'Experience with id {id} not found')

    bullet_rows = self.fetch_all(
      """
      SELECT text
      FROM experience_bullets
      WHERE experience_id = ?
      ORDER BY id ASC
      """,
      (str(id),),
    )
    bullets = [r['text'] for r in bullet_rows]

    experience = dict(row)
    experience['bullets'] = bullets

    return Experience(**experience)

  def update_experience(self, experience: Experience) -> Experience:
    self.execute(
      """
      UPDATE experiences
      SET title = ?, organization = ?, type = ?, location = ?, start_date = ?, end_date = ?
      WHERE id = ?
      """,
      (
        experience.title,
        experience.organization,
        experience.type.value,
        experience.location,
        experience.start_date,
        experience.end_date if experience.end_date else None,
        str(experience.id),
      ),
    )

    self.execute(
      """
      DELETE FROM experience_bullets
      WHERE experience_id = ?
      """,
      (str(experience.id),),
    )

    documents = []
    metadatas = []
    bullets = []

    for i, bullet_text in enumerate(experience.bullets):
      bullets.append((str(experience.id), bullet_text))

      context_aware_text = (
        f'Role: {experience.title}\n'
        f'Organization: {experience.organization}\n'
        f'Type: {experience.type.value}\n'
        f'Achievement: {bullet_text}\n'
      )

      documents.append(context_aware_text)
      metadatas.append({'experience_id': str(experience.id), 'bullet_index': i})

    if bullets:
      self.execute_many(
        """
        INSERT INTO experience_bullets (experience_id, text)
        VALUES (?, ?)
        """,
        bullets,
      )

    if documents:
      self.add_documents('experience_bullets', documents, metadatas)

    self.delete_documents('experience_bullets', {'experience_id': str(experience.id)})
    self.add_documents('experience_bullets', documents)

    return experience

  def delete_experience(self, id: UUID) -> None:
    self.execute(
      """
      DELETE FROM experiences
      WHERE id = ?
      """,
      (str(id),),
    )

    self.execute(
      """
      DELETE FROM experience_bullets
      WHERE experience_id = ?
      """,
      (str(id),),
    )

    self.delete_documents('experience_bullets', {'experience_id': str(id)})


_service = ExperienceService()

save_experience = _service.save_experience
load_experiences = _service.load_experiences
load_experience = _service.load_experience
update_experience = _service.update_experience
delete_experience = _service.delete_experience
