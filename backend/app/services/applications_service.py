import json
from typing import Literal
from uuid import UUID

from app.repositories import DatabaseRepository
from app.schemas import Application, Listing, Page, StatusEnum, StatusEvent
from app.utils.errors import NotFoundError, ValidationError


class ApplicationsService(DatabaseRepository):
  def __init__(self, **kwargs):
    super().__init__(**kwargs)

  def get(self, application_id: UUID) -> Application:
    row = self.fetch_one(
      """
      SELECT
        a.id as application_id,
        a.resume_id,
        l.id as listing_id, l.url, l.title, l.company, l.domain,
        l.location, l.description, l.posted_date, l.skills, l.requirements,
        COALESCE(
          json_group_array(
            json_object(
              'id', se.id,
              'status', se.status,
              'stage', se.stage,
              'created_at', se.created_at,
              'notes', se.notes
            )
          ),
          json_array()
        ) as status_events_json
      FROM applications a
      JOIN listings l ON a.listing_id = l.id
      LEFT JOIN status_events se ON a.id = se.application_id
      WHERE a.id = ?
      GROUP BY a.id, l.id
    """,
      (str(application_id),),
    )

    if not row:
      raise NotFoundError(f'Application {application_id} not found')

    row_dict = dict(row)
    status_events_json = row_dict.pop('status_events_json')
    application_id = row_dict.pop('application_id')
    resume_id = row_dict.pop('resume_id')

    status_events = [
      StatusEvent(**event) for event in json.loads(status_events_json) if event.get('id')
    ]

    return Application(
      id=application_id,
      listing_id=row_dict['listing_id'],
      resume_id=resume_id,
      status_events=status_events,
    )

  def get_by_resume_id(self, resume_id: UUID) -> Application:
    row = self.fetch_one(
      """
      SELECT
        a.id as application_id,
        a.resume_id,
        l.id as listing_id, l.url, l.title, l.company, l.domain,
        l.location, l.description, l.posted_date, l.skills, l.requirements,
        COALESCE(
          json_group_array(
            json_object(
              'id', se.id,
              'applicationId', se.application_id,
              'status', se.status,
              'stage', se.stage,
              'created_at', se.created_at,
              'notes', se.notes
            )
          ),
          json_array()
        ) as status_events_json
      FROM applications a
      JOIN listings l ON a.listing_id = l.id
      LEFT JOIN status_events se ON a.id = se.application_id
      WHERE a.resume_id = ?
      GROUP BY a.id, l.id
    """,
      (str(resume_id),),
    )

    if not row:
      raise NotFoundError(f'No application found for resume {resume_id}')

    row_dict = dict(row)
    status_events_json = row_dict.pop('status_events_json')
    application_id = row_dict.pop('application_id')
    resume_id = row_dict.pop('resume_id')

    status_events = [
      StatusEvent(**event) for event in json.loads(status_events_json) if event.get('id')
    ]

    return Application(
      id=application_id,
      listing_id=row_dict['listing_id'],
      resume_id=resume_id,
      status_events=status_events,
    )

  def get_by_listing_id(self, listing_id: UUID) -> Application:
    row = self.fetch_one(
      """
      SELECT
        a.id as application_id,
        a.resume_id,
        l.id as listing_id, l.url, l.title, l.company, l.domain,
        l.location, l.description, l.posted_date, l.skills, l.requirements,
        COALESCE(
          json_group_array(
            json_object(
              'id', se.id,
              'applicationId', se.application_id,
              'status', se.status,
              'stage', se.stage,
              'created_at', se.created_at,
              'notes', se.notes
            )
          ),
          json_array()
        ) as status_events_json
      FROM applications a
      JOIN listings l ON a.listing_id = l.id
      LEFT JOIN status_events se ON a.id = se.application_id
      WHERE a.listing_id = ?
      GROUP BY a.id, l.id
      ORDER BY a.id DESC
      LIMIT 1
    """,
      (str(listing_id),),
    )

    if not row:
      raise NotFoundError(f'No application found for listing {listing_id}')

    row_dict = dict(row)
    status_events_json = row_dict.pop('status_events_json')
    application_id = row_dict.pop('application_id')
    resume_id = row_dict.pop('resume_id')

    status_events = [
      StatusEvent(**event) for event in json.loads(status_events_json) if event.get('id')
    ]

    return Application(
      id=application_id,
      listing_id=row_dict['listing_id'],
      resume_id=resume_id,
      status_events=status_events,
    )

  def create(self, application: Application) -> Application:
    if not application.status_events:
      raise ValidationError('Application should at least have SAVED status event')

    operations: list[tuple[str, tuple]] = [
      (
        'INSERT INTO applications (id, listing_id, resume_id) VALUES (?, ?, ?)',
        (
          str(application.id),
          str(application.listing_id),
          str(application.resume_id) if application.resume_id else None,
        ),
      ),
    ]
    operations.extend(
      [
        (
          'INSERT INTO status_events (id, application_id, status, stage, created_at, notes) '
          'VALUES (?, ?, ?, ?, ?, ?)',
          (
            str(status_event.id),
            str(application.id),
            status_event.status.value,
            status_event.stage
            if status_event.status in [StatusEnum.SCREENING, StatusEnum.INTERVIEW]
            else 0,
            status_event.created_at,
            status_event.notes,
          ),
        )
        for status_event in application.status_events
      ]
    )

    self.transaction(operations)
    return application

  def update(self, application: Application) -> Application:
    existing_event_ids = self.fetch_all(
      'SELECT id FROM status_events WHERE application_id = ?', (str(application.id),)
    )
    existing_ids = {row['id'] for row in existing_event_ids}

    operations: list[tuple[str, tuple]] = [
      (
        'UPDATE applications SET resume_id = ? WHERE id = ?',
        (str(application.resume_id) if application.resume_id else None, str(application.id)),
      ),
    ]

    # Status_events can only be added, not modified or deleted
    new_status_events = [
      status_event
      for status_event in application.status_events
      if str(status_event.id) not in existing_ids
    ]

    operations.extend(
      [
        (
          'INSERT INTO status_events (id, application_id, status, stage, created_at, notes) '
          'VALUES (?, ?, ?, ?, ?, ?)',
          (
            str(status_event.id),
            str(application.id),
            status_event.status.value,
            status_event.stage
            if status_event.status in [StatusEnum.SCREENING, StatusEnum.INTERVIEW]
            else 0,
            status_event.created_at,
            status_event.notes,
          ),
        )
        for status_event in new_status_events
      ]
    )

    self.transaction(operations)
    return application
