import type { ISODatetime } from '@/utils/date';

import type { Listing } from './listing';

export type StatusEnum =
  | 'SAVED'
  | 'APPLIED'
  | 'SCREENING'
  | 'INTERVIEW'
  | 'OFFER_RECEIVED'
  | 'ACCEPTED'
  | 'REJECTED'
  | 'GHOSTED'
  | 'WITHDRAWN'
  | 'RESCINDED';

export type Application = {
  id: string;
  listing: Listing;
  resumeId: string | null;
  statusEvents: StatusEvent[];
  currentStatus: StatusEnum;
  currentStage: number;
  timeline: StatusEvent[];
};

export type StatusEvent = {
  id: string;
  applicationId: string;
  status: StatusEnum;
  stage: number;
  createdAt: ISODatetime;
  notes: string | null;
};
