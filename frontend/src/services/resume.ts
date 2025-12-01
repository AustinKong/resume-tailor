import type { Resume, ResumeData } from '@/types/resume';

export async function generateResume(listingId: string): Promise<{ html: string; resume: Resume }> {
  const response = await fetch(`/api/resume/?listing_id=${listingId}`, {
    method: 'POST',
  });

  if (!response.ok) {
    throw new Error('Failed to generate resume');
  }

  return response.json();
}

export async function updateResume(
  resumeId: string,
  data: ResumeData
): Promise<{ html: string; resume: Resume }> {
  const response = await fetch(`/api/resume/${resumeId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('Failed to update resume');
  }

  return response.json();
}
