import React from 'react';
import {
  PiArrowLeft,
  PiBookmarkSimple,
  PiCheckCircle,
  PiEye,
  PiGhost,
  PiHandHeart,
  PiMicrophone,
  PiPaperPlaneTilt,
  PiX,
  PiXCircle,
} from 'react-icons/pi';

import type { StatusEnum } from '@/types/application';

export const STATUS_DEFINITIONS: Record<
  StatusEnum,
  { label: string; icon: React.ComponentType; colorPalette: string }
> = {
  SAVED: { label: 'Saved', icon: PiBookmarkSimple, colorPalette: 'grey' },
  APPLIED: { label: 'Applied', icon: PiPaperPlaneTilt, colorPalette: 'blue' },
  SCREENING: { label: 'Screening', icon: PiEye, colorPalette: 'blue' },
  INTERVIEW: { label: 'Interview', icon: PiMicrophone, colorPalette: 'blue' },
  OFFER_RECEIVED: { label: 'Offer Received', icon: PiHandHeart, colorPalette: 'green' },
  ACCEPTED: { label: 'Accepted', icon: PiCheckCircle, colorPalette: 'green' },
  REJECTED: { label: 'Rejected', icon: PiXCircle, colorPalette: 'red' },
  GHOSTED: { label: 'Ghosted', icon: PiGhost, colorPalette: 'red' },
  WITHDRAWN: { label: 'Withdrawn', icon: PiArrowLeft, colorPalette: 'red' },
  RESCINDED: { label: 'Rescinded', icon: PiX, colorPalette: 'red' },
};

export const STATUS_OPTIONS = Object.entries(STATUS_DEFINITIONS).map(([value, def]) => ({
  value: value as StatusEnum,
  label: def.label,
  icon: def.icon,
}));
