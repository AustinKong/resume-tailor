import { ISOYearMonth } from '@/utils/date';

export type ExperienceType = 'Full-time' | 'Part-time' | 'Internship' | 'Freelance' | 'Contract';

export type Experience = {
  id?: string;
  title: string;
  organization: string;
  type: ExperienceType;
  location?: string;
  startDate: ISOYearMonth;
  endDate?: ISOYearMonth;
  bullets: string[];
};

export function emptyExperience<T extends ExperienceType>(type: T): Experience {
  return {
    title: '',
    organization: '',
    startDate: ISOYearMonth.today(),
    bullets: [],
    type,
  };
}
