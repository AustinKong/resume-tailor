import type { YearMonth } from '@/utils/yearMonth';

export type Education = {
  institution: string;
  program: string;
  location?: string;
  startDate: YearMonth;
  endDate?: YearMonth;
  bulletPoints: string[];
};

export type Profile = {
  fullName: string;
  email: string;
  phone?: string;
  location?: string;
  website?: string;
  education: Education[];
  certifications: string[];
  awards: string[];
};
