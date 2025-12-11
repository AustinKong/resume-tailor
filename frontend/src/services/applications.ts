import type { Application, StatusEnum, StatusEvent } from '@/types/application';
import type { Page } from '@/types/common';

export async function getApplications(
  page: number = 1,
  size: number = 10,
  search?: string,
  status?: StatusEnum[],
  sortBy?: 'title' | 'company' | 'posted_at' | 'updated_at',
  sortDir?: 'asc' | 'desc'
): Promise<Page<Application>> {
  const params = new URLSearchParams({
    page: page.toString(),
    size: size.toString(),
  });

  if (sortBy) params.append('sort_by', sortBy);
  if (sortDir) params.append('sort_dir', sortDir);
  if (search) params.append('search', search);
  if (status && status.length > 0) {
    status.forEach((s) => params.append('status', s));
  }

  const response = await fetch(`/api/applications?${params.toString()}`);

  if (!response.ok) {
    throw new Error('Failed to fetch applications');
  }

  const json = await response.json();
  return json as Page<Application>;
}

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
