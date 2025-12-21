import type { Listing, ListingDraft, ListingDraftUnique } from '@/types/listing';

export async function scrapeListing(url: string, id: string): Promise<ListingDraft> {
  const response = await fetch('/api/listings/scrape', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ url, id }),
  });

  if (!response.ok) {
    throw new Error('Failed to scrape listing');
  }

  const json = await response.json();
  return json as ListingDraft;
}

// Convert ListingDraft to Listing for saving (only unique listings can be saved)
export async function saveListings(drafts: ListingDraft[]) {
  const listingsToSave: Listing[] = drafts
    .filter((draft): draft is ListingDraftUnique => draft.status === 'unique')
    .map((draft) => ({
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
    }));

  const response = await fetch('/api/listings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(listingsToSave),
  });

  if (!response.ok) {
    throw new Error('Failed to save listings');
  }

  const json = await response.json();
  return json as Listing[];
}

export async function getListings() {
  const response = await fetch('/api/listings');

  if (!response.ok) {
    throw new Error('Failed to fetch listings');
  }

  const json = await response.json();
  return json as Listing[];
}

export async function extractListing(
  id: string,
  url: string,
  content: string
): Promise<ListingDraft> {
  const response = await fetch('/api/listings/extract', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ id, url, content }),
  });

  if (!response.ok) {
    throw new Error('Failed to extract listing');
  }

  const json = await response.json();
  return json as ListingDraft;
}
