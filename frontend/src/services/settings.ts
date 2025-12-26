import { type SettingsSection } from '@/types/settings';

export async function getSettings(): Promise<Record<string, SettingsSection>> {
  const response = await fetch('/api/config');

  if (!response.ok) {
    throw new Error('Failed to fetch settings');
  }

  const json = await response.json();
  return json;
}

export async function updateSettings(
  updates: Record<string, unknown>
): Promise<Record<string, SettingsSection>> {
  const response = await fetch('/api/config', {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updates),
  });

  if (!response.ok) {
    throw new Error('Failed to update settings');
  }

  const json = await response.json();
  return json;
}
