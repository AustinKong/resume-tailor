import { YearMonth } from '@/utils/yearMonth';

export type Education = {
  institution: string;
  program: string;
  location?: string;
  startDate: YearMonth;
  endDate?: YearMonth;
  bullets: string[];
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

export const emptyProfile: Profile = {
  fullName: '',
  email: '',
  education: [],
  certifications: [],
  awards: [],
};

export const emptyEducation: Education = {
  institution: '',
  program: '',
  startDate: YearMonth.today(),
  bullets: [],
};
