import type { Application } from '@/types/application';

export async function getApplications() {
  const response = await fetch('/api/applications');

  if (!response.ok) {
    throw new Error('Failed to fetch applications');
  }

  const json = await response.json();
  return json as Application[];
}
