import { useQuery } from '@tanstack/react-query';

import { getProfile } from '@/services/profile';

export function useProfileQuery() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['profile'],
    queryFn: getProfile,
  });

  return {
    profile: data,
    isLoading,
    isError,
  };
}
