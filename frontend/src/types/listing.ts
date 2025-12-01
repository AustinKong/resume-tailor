import { ISODate } from '@/utils/date';

export type Listing = {
  id: string;
  url: string;
  title: string;
  company: string;
  location?: string;
  description: string;
  postedDate?: ISODate;
  keywords: string[];
  resumeIds: string[];
};

export type ScrapeResult = {
  unique: Listing[];
  duplicates: {
    listing: Listing;
    duplicateOf: Listing;
  }[];
};
