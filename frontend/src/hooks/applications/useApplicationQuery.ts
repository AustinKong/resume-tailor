import { useQuery } from '@tanstack/react-query';

import { getApplication } from '@/services/applications';

export function useApplicationQuery(applicationId: string | null | undefined) {
  const {
    data: application,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['application', applicationId],
    queryFn: () => getApplication(applicationId!),
    enabled: !!applicationId,
  });

  return {
    application,
    isLoading,
    isError,
  };
}
