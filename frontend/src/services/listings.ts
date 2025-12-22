import type { Listing, ListingDraft } from '@/types/listing';

export async function ingestListing(
  url: string,
  content?: string,
  id?: string
): Promise<ListingDraft> {
  const body: { url: string; content?: string; id?: string } = { url };
  if (content && content.trim() !== '') {
    body.content = content;
  }
  if (id) {
    body.id = id;
  }

  const response = await fetch('/api/listings/draft', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error('Failed to ingest listing');
  }

  const json = await response.json();
  return json as ListingDraft;
}

// Convert ListingDraft to Listing for saving (only unique listings can be saved)
export async function saveListing(draft: ListingDraft) {
  // Only unique listings can be saved
  if (draft.status !== 'unique') {
    throw new Error('Only unique listings can be saved');
  }

  const listingToSave: Listing = {
    id: draft.id,
    url: draft.url,
    title: draft.listing.title,
    company: draft.listing.company,
    domain: draft.listing.domain,
    location: draft.listing.location,
    description: draft.listing.description,
    postedDate: draft.listing.postedDate,
    skills: draft.listing.skills.map((s) => s.value),
    requirements: draft.listing.requirements.map((r) => r.value),
  };

  const response = await fetch('/api/listings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(listingToSave),
  });

  if (!response.ok) {
    throw new Error('Failed to save listing');
  }

  const json = await response.json();
  return json as Listing;
}

export async function getListings() {
  const response = await fetch('/api/listings');

  if (!response.ok) {
    throw new Error('Failed to fetch listings');
  }

  const json = await response.json();
  return json as Listing[];
}
