import type { Resume, ResumeData } from '@/types/resume';

export async function getResume(resumeId: string): Promise<Resume> {
  const response = await fetch(`/api/resume/${resumeId}`);

  if (!response.ok) {
    throw new Error('Failed to get resume');
  }

  return response.json();
}

export async function getResumeHtml(resumeId: string): Promise<string> {
  const response = await fetch(`/api/resume/${resumeId}/html`);

  if (!response.ok) {
    throw new Error('Failed to get resume HTML');
  }

  const data = await response.json();
  return data.html;
}

export async function createShellResume(listingId: string): Promise<Resume> {
  const response = await fetch(`/api/resume/?listing_id=${listingId}`, {
    method: 'POST',
  });

  if (!response.ok) {
    throw new Error('Failed to create resume shell');
  }

  return response.json();
}

export async function generateResumeContent(resumeId: string): Promise<Resume> {
  const response = await fetch(`/api/resume/${resumeId}/generate`, {
    method: 'POST',
  });

  if (!response.ok) {
    throw new Error('Failed to generate resume content');
  }

  return response.json();
}

export async function updateResume(resumeId: string, data: ResumeData): Promise<Resume> {
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

export async function deleteResume(resumeId: string): Promise<void> {
  const response = await fetch(`/api/resume/${resumeId}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error('Failed to delete resume');
  }
}

export async function exportResumePdf(resumeId: string, latestData: ResumeData): Promise<Blob> {
  await updateResume(resumeId, latestData);

  const response = await fetch(`/api/resume/${resumeId}/export`);

  if (!response.ok) {
    throw new Error('Failed to export resume as PDF');
  }

  return response.blob();
}
