from collections import defaultdict
from uuid import UUID

from app.repositories import DatabaseRepository, VectorRepository
from app.schemas import Experience, Listing
from app.utils.errors import NotFoundError, ServiceError


class ExperiencesService(DatabaseRepository, VectorRepository):
  def __init__(self):
    super().__init__()

  def get(self, id: UUID) -> Experience:
    row = self.fetch_one(
      """
      SELECT id, title, organization, type, location, start_date, end_date
      FROM experiences
      WHERE id = ?
      """,
      (str(id),),
    )
    if not row:
      raise NotFoundError(f'Experience with id {id} not found')

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

  def list_all(self) -> list[Experience]:
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

  def find_relevant(
    self,
    listing: Listing,
    top_k_experiences: int = 3,
    max_bullets_per_experience: int = 4,
  ) -> list[Experience]:
    if not listing.requirements:
      return []

    requirement_queries = []
    for requirement in listing.requirements:
      query_text = f'Role: {listing.title}\nAchievement: {requirement}'
      requirement_queries.append((requirement, query_text))

    all_search_results = []
    for _requirement_text, query_text in requirement_queries:
      results = self.search_documents('experience_bullets', query_text, k=5)
      all_search_results.extend(results)

    experience_hits = defaultdict(lambda: defaultdict(lambda: {'score': 0.0, 'text': ''}))

    for _doc_text, metadata, similarity_score in all_search_results:
      experience_id = metadata.get('experience_id')
      bullet_index = metadata.get('bullet_index')

      if experience_id is None or bullet_index is None:
        continue

      experience_hits[experience_id][bullet_index]['score'] += similarity_score
      experience_hits[experience_id][bullet_index]['text'] = _doc_text

    if not experience_hits:
      return []

    experience_scores = {}
    for exp_id, bullets in experience_hits.items():
      total_score = sum(float(bullet_data['score']) for bullet_data in bullets.values())
      experience_scores[exp_id] = total_score

    sorted_experiences = sorted(experience_scores.items(), key=lambda x: x[1], reverse=True)[
      :top_k_experiences
    ]

    result = []
    added_ids = set()
    for exp_id, _total_score in sorted_experiences:
      if exp_id in added_ids:
        continue
      added_ids.add(exp_id)
      experience = self.get(UUID(exp_id))
      matched_bullet_data = experience_hits[exp_id]
      sorted_bullets = sorted(
        matched_bullet_data.items(), key=lambda x: x[1]['score'], reverse=True
      )[:max_bullets_per_experience]
      pruned_bullets = [experience.bullets[bullet_index] for bullet_index, _ in sorted_bullets]
      exp_dict = experience.model_dump()
      exp_dict.pop('bullets', None)
      pruned_experience = Experience(**exp_dict, bullets=pruned_bullets)
      result.append(pruned_experience)

    return result

  def create(self, experience: Experience) -> Experience:
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

      documents.append(self._create_bullet_embedding_text(experience, bullet_text))
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
      try:
        self.add_documents('experience_bullets', documents, metadatas)
      except Exception as e:
        raise ServiceError(f'Failed to save experience embeddings: {str(e)}') from e

    return experience

  def update(self, experience: Experience) -> Experience:
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

      documents.append(self._create_bullet_embedding_text(experience, bullet_text))
      metadatas.append({'experience_id': str(experience.id), 'bullet_index': i})

    if bullets:
      self.execute_many(
        """
        INSERT INTO experience_bullets (experience_id, text)
        VALUES (?, ?)
        """,
        bullets,
      )

    self.delete_documents('experience_bullets', {'experience_id': str(experience.id)})
    if documents:
      self.add_documents('experience_bullets', documents, metadatas)

    return experience

  def delete(self, id: UUID) -> None:
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

  def _create_bullet_embedding_text(self, experience: Experience, bullet: str) -> str:
    return f'Role: {experience.title}\nAchievement: {bullet}\n'
