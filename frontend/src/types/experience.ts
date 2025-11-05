import { YearMonth } from '@/utils/yearMonth';

export type ExperienceType = 'Full-time' | 'Part-time' | 'Internship' | 'Freelance' | 'Contract';

export type Experience = {
  id?: string;
  title: string;
  organization: string;
  type: ExperienceType;
  location?: string;
  startDate: YearMonth;
  endDate?: YearMonth;
  bullets: string[];
};

export function emptyExperience<T extends ExperienceType>(type: T): Experience {
  return {
    title: '',
    organization: '',
    startDate: YearMonth.today(),
    bullets: [],
    type,
  };
}
