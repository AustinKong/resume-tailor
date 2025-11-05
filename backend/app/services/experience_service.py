import os
import sqlite3
from uuid import UUID

from langchain_chroma import Chroma
from langchain_core.documents import Document
from langchain_openai import OpenAIEmbeddings

from app.schemas.experience import Experience

DB_PATH = os.getenv('DB_PATH', 'data/db.sqlite3')
VEC_PATH = os.getenv('VEC_PATH', 'data/vecs')

embeddings = OpenAIEmbeddings(model='text-embedding-3-large')
vector_store = Chroma(
  collection_name='experience_bullets',
  embedding_function=embeddings,
  persist_directory=VEC_PATH,
)


def save_experience(experience: Experience) -> Experience:
  with sqlite3.connect(DB_PATH) as db:
    db.execute(
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
    bullets = []

    for i, bullet_text in enumerate(experience.bullets):
      bullets.append((str(experience.id), bullet_text))

      context_aware_text = (
        f'Role: {experience.title}\n'
        f'Organization: {experience.organization}\n'
        f'Type: {experience.type.value}\n'
        f'Achievement: {bullet_text}\n'
      )

      documents.append(
        Document(
          page_content=context_aware_text,
          metadata={'experience_id': str(experience.id), 'bullet_index': i},
        ),
      )

    if bullets:
      db.executemany(
        """
        INSERT INTO experience_bullets (experience_id, text)
        VALUES (?, ?)
        """,
        bullets,
      )

    if documents:
      vector_store.add_documents(documents)

    db.commit()

  return experience


def load_experiences() -> list[Experience]:
  with sqlite3.connect(DB_PATH) as db:
    db.row_factory = sqlite3.Row

    cursor = db.execute(
      """
      SELECT id, title, organization, type, location, start_date, end_date
      FROM experiences
      ORDER BY start_date DESC
      """,
    )

    experiences = []
    for row in cursor.fetchall():
      exp_id = row['id']

      cursor_bullets = db.execute(
        """
        SELECT text
        FROM experience_bullets
        WHERE experience_id = ?
        ORDER BY id ASC
        """,
        (exp_id,),
      )
      bullets = [r['text'] for r in cursor_bullets.fetchall()]

      experience = dict(row)
      experience['bullets'] = bullets

      experiences.append(Experience(**experience))

    return experiences


def load_experience(id: UUID) -> Experience:
  with sqlite3.connect(DB_PATH) as db:
    db.row_factory = sqlite3.Row

    cursor = db.execute(
      """
      SELECT id, title, organization, type, location, start_date, end_date
      FROM experiences
      WHERE id = ?
      """,
      (str(id),),
    )
    row = cursor.fetchone()
    if not row:
      raise ValueError(f'Experience with id {id} not found')

    cursor = db.execute(
      """
      SELECT text
      FROM experience_bullets
      WHERE experience_id = ?
      ORDER BY id ASC
      """,
      (str(id),),
    )
    bullets = [r['text'] for r in cursor.fetchall()]

    experience = dict(row)
    experience['bullets'] = bullets

    return Experience(**experience)


def update_experience(experience: Experience) -> Experience:
  with sqlite3.connect(DB_PATH) as db:
    db.execute(
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

    db.execute(
      """
      DELETE FROM experience_bullets
      WHERE experience_id = ?
      """,
      (str(experience.id),),
    )

    documents = []
    bullets = []

    for i, bullet_text in enumerate(experience.bullets):
      bullets.append((str(experience.id), bullet_text))

      context_aware_text = (
        f'Role: {experience.title}\n'
        f'Organization: {experience.organization}\n'
        f'Type: {experience.type.value}\n'
        f'Achievement: {bullet_text}\n'
      )

      documents.append(
        Document(
          page_content=context_aware_text,
          metadata={'experience_id': str(experience.id), 'bullet_index': i},
        ),
      )

    if bullets:
      db.executemany(
        """
        INSERT INTO experience_bullets (experience_id, text)
        VALUES (?, ?)
        """,
        bullets,
      )

    existing_docs = vector_store.get(where={'experience_id': str(experience.id)})

    if existing_docs['ids']:
      vector_store.delete(ids=existing_docs['ids'])

    if documents:
      vector_store.add_documents(documents)

    db.commit()

  return experience


def delete_experience(id: UUID) -> None:
  with sqlite3.connect(DB_PATH) as db:
    db.execute(
      """
      DELETE FROM experiences
      WHERE id = ?
      """,
      (str(id),),
    )

    db.execute(
      """
      DELETE FROM experience_bullets
      WHERE experience_id = ?
      """,
      (str(id),),
    )

    existing_docs = vector_store.get(where={'experience_id': str(id)})

    if existing_docs['ids']:
      vector_store.delete(ids=existing_docs['ids'])

    db.commit()
