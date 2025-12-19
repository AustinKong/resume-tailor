import { ISOYearMonth } from '@/utils/date';

export type Education = {
  institution: string;
  program: string;
  location: string | null;
  startDate: ISOYearMonth;
  endDate: ISOYearMonth | null;
  bullets: string[];
};

export type Profile = {
  fullName: string;
  email: string;
  phone: string | null;
  location: string | null;
  website: string | null;
  education: Education[];
  certifications: string[];
  awards: string[];
};

export const emptyProfile: Profile = {
  fullName: '',
  email: '',
  phone: null,
  location: null,
  website: null,
  education: [],
  certifications: [],
  awards: [],
};

export const emptyEducation: Education = {
  institution: '',
  program: '',
  location: null,
  startDate: ISOYearMonth.today(),
  endDate: null,
  bullets: [],
};
