import { type Profile } from '@/types/profile';

export async function getProfile() {
  const response = await fetch(`/api/profile`);

  if (!response.ok) {
    throw new Error('Failed to fetch profile data');
  }

  const json = await response.json();
  return json;
}

export async function updateProfile(profile: Profile) {
  const response = await fetch(`/api/profile`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(profile),
  });

  if (!response.ok) {
    throw new Error('Failed to update profile data');
  }

  const json = await response.json();
  return json;
}
