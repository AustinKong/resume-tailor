import { ISODate } from '@/utils/date';

export type Listing = {
  id: string;
  url: string;
  title: string;
  company: string;
  domain: string;
  location?: string;
  description: string;
  postedDate?: ISODate;
  skills: string[];
  requirements: string[];
};

export type GroundedItem<T = string> = {
  value: T;
  quote: string | null;
};

export const ScrapeStatus = {
  COMPLETED: 'completed',
  DUPLICATE_URL: 'duplicate_url',
  DUPLICATE_SEMANTIC: 'duplicate_semantic',
  FAILED: 'failed',
} as const;

export type ScrapeStatus = (typeof ScrapeStatus)[keyof typeof ScrapeStatus];

export type ScrapingListing = {
  id: string;
  url: string;
  title: string;
  company: string;
  domain: string;
  location: string | null;
  description: string;
  postedDate: ISODate | null;
  skills: GroundedItem<string>[];
  requirements: GroundedItem<string>[];
  error: string | null;
  html: string | null;
  status: ScrapeStatus;
  duplicateOf: Listing | null;
};

export type ScrapeResult = {
  unique: Listing[];
  duplicates: {
    listing: Listing;
    duplicateOf: Listing;
  }[];
};
