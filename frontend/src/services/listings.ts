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
export async function saveListing(listingDraft: ListingDraft) {
  // Only unique listings or duplicate_content (after editing) can be saved
  if (listingDraft.status !== 'unique' && listingDraft.status !== 'duplicate_content') {
    throw new Error('Only unique or edited duplicate listings can be saved');
  }

  const listingToSave: Listing = {
    ...listingDraft.listing,
    id: listingDraft.id,
    url: listingDraft.url,
    skills: listingDraft.listing.skills.map((s) => s.value),
    requirements: listingDraft.listing.requirements.map((r) => r.value),
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
