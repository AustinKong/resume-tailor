import json

from app.repositories import DatabaseRepository
from app.schemas import Application, Listing, StatusEvent
from app.utils.errors import ValidationError


class ApplicationsService(DatabaseRepository):
  def __init__(self, **kwargs):
    super().__init__(**kwargs)

  def list_all(self) -> list[Application]:
    rows = self.fetch_all("""
      SELECT
        a.id as application_id,
        l.id as listing_id, l.url, l.title, l.company, l.domain,
        l.location, l.description, l.posted_date, l.skills, l.requirements,
        COALESCE(
          json_group_array(
            json_object(
              'id', se.id,
              'applicationId', se.application_id,
              'status', se.status,
              'stage', se.stage,
              'date', se.date,
              'notes', se.notes
            )
          ),
          json_array()
        ) as status_events_json
      FROM applications a
      JOIN listings l ON a.listing_id = l.id
      LEFT JOIN status_events se ON a.id = se.application_id
      GROUP BY a.id, l.id
    """)

    applications = []
    for row in rows:
      row_dict = dict(row)
      status_events_json = row_dict.pop('status_events_json')
      application_id = row_dict.pop('application_id')

      status_events = [
        StatusEvent(**event) for event in json.loads(status_events_json) if event.get('id')
      ]
      applications.append(
        Application(id=application_id, listing=Listing(**row_dict), status_events=status_events)
      )

    return applications

  def create(self, application: Application) -> Application:
    if not application.status_events:
      raise ValidationError('Application should at least have SAVED status event')

    operations: list[tuple[str, tuple]] = [
      (
        'INSERT INTO applications (id, listing_id) VALUES (?, ?)',
        (str(application.id), str(application.listing.id)),
      ),
    ]
    operations.extend(
      [
        (
          'INSERT INTO status_events (id, application_id, status, stage, date, notes) '
          'VALUES (?, ?, ?, ?, ?, ?)',
          (
            str(status_event.id),
            str(application.id),
            status_event.status.value,
            status_event.stage,
            status_event.date.isoformat(),
            status_event.notes,
          ),
        )
        for status_event in application.status_events
      ]
    )

    self.transaction(operations)
    return application

  def update(self, application: Application) -> Application:
    operations: list[tuple[str, tuple]] = [
      # Right now, there is nothing in Application to update other than status events
      # (
      #   'UPDATE applications SET listing_id = ? WHERE id = ?',
      #   (str(application.listing.id), str(application.id))
      # ),
      ('DELETE FROM status_events WHERE application_id = ?', (str(application.id),))
    ]

    operations.extend(
      [
        (
          'INSERT INTO status_events (id, application_id, status, stage, date, notes) '
          'VALUES (?, ?, ?, ?, ?, ?)',
          (
            str(status_event.id),
            str(application.id),
            status_event.status.value,
            status_event.stage,
            status_event.date.isoformat(),
            status_event.notes,
          ),
        )
        for status_event in application.status_events
      ]
    )

    self.transaction(operations)
    return application
