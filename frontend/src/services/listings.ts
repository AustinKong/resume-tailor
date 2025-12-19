import type { Listing, ScrapingListing } from '@/types/listing';

export async function scrapeListings(urls: string[]): Promise<ScrapingListing[]> {
  const response = await fetch('/api/listings/scrape', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(urls),
  });

  if (!response.ok) {
    throw new Error('Failed to scrape listings');
  }

  const json = await response.json();
  return json as ScrapingListing[];
}

// Convert ScrapingListing to Listing before sending by removing transient fields (status, html etc.)
export async function saveListings(listings: ScrapingListing[]) {
  const transformedListings: Listing[] = listings.map(
    ({
      html: _html,
      status: _status,
      error: _error,
      duplicateOf: _duplicateOf,
      requirements,
      skills,
      ...rest
    }) => ({
      requirements: requirements.map((r) => r.value),
      skills: skills.map((s) => s.value),
      ...rest,
    })
  );

  const response = await fetch('/api/listings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(transformedListings),
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
): Promise<ScrapingListing> {
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
  return json as ScrapingListing;
}
