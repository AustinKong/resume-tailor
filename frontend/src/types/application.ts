import type { ISODatetime } from '@/utils/date';

import type { Listing } from './listing';

export type Application = {
  id: string;
  listing: Listing;
  resumeId?: string;
  statusEvents: StatusEvent[];
};

export type StatusEvent = {
  id: string;
  applicationId: string;
  status: 'SAVED' | 'APPLIED' | 'INTERVIEW' | 'ACCEPTED' | 'REJECTED' | 'GHOSTED';
  stage: number;
  createdAt: ISODatetime;
  notes?: string;
};
