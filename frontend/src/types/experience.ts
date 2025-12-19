import { ISOYearMonth } from '@/utils/date';

export type ExperienceType = 'Full-time' | 'Part-time' | 'Internship' | 'Freelance' | 'Contract';

export type Experience = {
  id: string | null;
  title: string;
  organization: string;
  type: ExperienceType;
  location: string | null;
  startDate: ISOYearMonth;
  endDate: ISOYearMonth | null;
  bullets: string[];
};

export function emptyExperience<T extends ExperienceType>(type: T): Experience {
  return {
    id: null,
    title: '',
    organization: '',
    location: null,
    startDate: ISOYearMonth.today(),
    endDate: null,
    bullets: [],
    type,
  };
}
