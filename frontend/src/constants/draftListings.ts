import React from 'react';
import { PiCheckCircle, PiClock, PiCopy, PiLink, PiWarning } from 'react-icons/pi';

import type { ListingDraft } from '@/types/listing';

export const DRAFT_LISTING_DEFINITIONS: Record<
  ListingDraft['status'],
  { label: string; icon: React.ComponentType; colorPalette: string }
> = {
  pending: { label: 'Pending', icon: PiClock, colorPalette: 'blue' },
  unique: { label: 'OK', icon: PiCheckCircle, colorPalette: 'green' },
  duplicate_url: { label: 'Duplicate URL', icon: PiLink, colorPalette: 'orange' },
  duplicate_content: { label: 'Duplicate Content', icon: PiCopy, colorPalette: 'orange' },
  error: { label: 'Error', icon: PiWarning, colorPalette: 'red' },
};

export const getTitle = (listingDraft: ListingDraft): string => {
  switch (listingDraft.status) {
    case 'unique':
      return listingDraft.listing.title;
    case 'duplicate_url':
    case 'duplicate_content':
      return listingDraft.duplicateOf.title;
    case 'error':
      return 'Error';
    case 'pending':
      return 'Scraping...';
  }
};

export const getCompany = (listingDraft: ListingDraft): string => {
  switch (listingDraft.status) {
    case 'unique':
      return listingDraft.listing.company;
    case 'duplicate_url':
    case 'duplicate_content':
      return listingDraft.duplicateOf.company;
    case 'error':
      return '';
    case 'pending':
      return '';
  }
};

export const getDomain = (listingDraft: ListingDraft): string => {
  switch (listingDraft.status) {
    case 'unique':
      return listingDraft.listing.domain;
    case 'duplicate_url':
    case 'duplicate_content':
      return listingDraft.duplicateOf.domain;
    case 'error':
      return '';
    case 'pending':
      return '';
  }
};
