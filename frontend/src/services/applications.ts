import type { Application, StatusEvent } from '@/types/application';

export async function getApplication(applicationId: string): Promise<Application> {
  const response = await fetch(`/api/applications/${applicationId}`);

  if (!response.ok) {
    throw new Error('Failed to fetch application');
  }

  const json = await response.json();
  return json as Application;
}

export async function addStatusEvent(
  applicationId: string,
  statusEvent: Omit<StatusEvent, 'applicationId' | 'id' | 'createdAt'>
): Promise<Application> {
  const response = await fetch(`/api/applications/${applicationId}/status-event`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(statusEvent),
  });

  if (!response.ok) {
    throw new Error('Failed to add status event');
  }

  const json = await response.json();
  return json as Application;
}
