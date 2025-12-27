import { ISODate } from '@/utils/date';

import type { Application, StatusEnum } from './application';

export type Listing = {
  id: string;
  url: string;
  title: string;
  company: string;
  domain: string;
  location: string | null;
  description: string;
  postedDate: ISODate | null;
  skills: string[];
  requirements: string[];
  applications: Application[];
};

export type ListingSummary = {
  id: string;
  url: string;
  title: string;
  company: string;
  domain: string;
  location: string | null;
  postedDate: ISODate | null;
  currentStatus: StatusEnum | null;
  lastUpdated: string | null;
};

export type GroundedItem<T = string> = {
  value: T;
  quote: string | null;
};

export type ListingExtraction = {
  title: string;
  company: string;
  domain: string;
  location: string | null;
  description: string;
  postedDate: ISODate | null;
  skills: GroundedItem<string>[];
  requirements: GroundedItem<string>[];
};

type BaseListingDraft = {
  id: string;
  url: string;
};

export type ListingDraftUnique = BaseListingDraft & {
  status: 'unique';
  listing: ListingExtraction;
  html: string | null;
};

export type ListingDraftDuplicateUrl = BaseListingDraft & {
  status: 'duplicate_url';
  duplicateOf: Listing;
  duplicateOfApplicationId: string;
};

export type ListingDraftDuplicateContent = BaseListingDraft & {
  status: 'duplicate_content';
  listing: ListingExtraction;
  duplicateOf: Listing;
  duplicateOfApplicationId: string;
  html: string | null;
};

export type ListingDraftError = BaseListingDraft & {
  status: 'error';
  error: string;
  html: string | null;
};

export type ListingDraftPending = BaseListingDraft & {
  status: 'pending';
};

export type ListingDraft =
  | ListingDraftPending
  | ListingDraftUnique
  | ListingDraftDuplicateUrl
  | ListingDraftDuplicateContent
  | ListingDraftError;
