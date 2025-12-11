import { useQuery } from '@tanstack/react-query';

import { getExperiences } from '@/services/experience';

export function useExperiencesQuery() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['experiences'],
    queryFn: getExperiences,
  });

  return {
    experiences: data,
    isLoading,
    isError,
  };
}
