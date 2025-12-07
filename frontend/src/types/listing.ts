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
  resumeIds: string[];
};

export type ScrapeResult = {
  unique: Listing[];
  duplicates: {
    listing: Listing;
    duplicateOf: Listing;
  }[];
};
