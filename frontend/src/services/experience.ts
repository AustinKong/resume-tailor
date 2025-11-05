import { type Experience } from '@/types/experience';

export async function getExperiences() {
  const response = await fetch('/api/experience');

  if (!response.ok) {
    throw new Error('Failed to fetch experiences');
  }

  const json = await response.json();
  return json as Experience[];
}

export async function getExperience(id: string) {
  const response = await fetch(`/api/experience/${id}`);

  if (!response.ok) {
    throw new Error('Failed to fetch experience');
  }

  const json = await response.json();
  return json as Experience;
}

export async function createExperience(experience: Omit<Experience, 'id'>) {
  const response = await fetch('/api/experience', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(experience),
  });

  if (!response.ok) {
    throw new Error('Failed to create experience');
  }

  const json = await response.json();
  return json as Experience;
}

export async function updateExperience(experience: Experience) {
  const response = await fetch('/api/experience', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(experience),
  });

  if (!response.ok) {
    throw new Error('Failed to update experience');
  }

  const json = await response.json();
  return json as Experience;
}

export async function deleteExperience(id: string) {
  const response = await fetch(`/api/experience/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error('Failed to delete experience');
  }
}
