import type { StatusEnum } from '@/types/application';
import type { Page } from '@/types/common';
import type { Listing, ListingDraft, ListingSummary } from '@/types/listing';

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
    applications: [],
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

export async function getListings(
  page: number = 1,
  size: number = 10,
  search?: string,
  status?: StatusEnum[],
  sortBy?: 'title' | 'company' | 'posted_at' | 'updated_at',
  sortDir?: 'asc' | 'desc'
): Promise<Page<ListingSummary>> {
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

  const response = await fetch(`/api/listings?${params.toString()}`);

  if (!response.ok) {
    throw new Error('Failed to fetch listings');
  }

  const json = await response.json();
  return json as Page<ListingSummary>;
}

export async function getListing(listingId: string): Promise<Listing> {
  const response = await fetch(`/api/listings/${listingId}`);

  if (!response.ok) {
    throw new Error('Failed to fetch listing');
  }

  const json = await response.json();
  return json as Listing;
}
