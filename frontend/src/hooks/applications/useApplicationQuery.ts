import { useQuery, useQueryClient } from '@tanstack/react-query';

import { getApplication } from '@/services/applications';
import type { Application } from '@/types/application';

export function useApplicationQuery(applicationId: string | null | undefined) {
  const queryClient = useQueryClient();

  const {
    data: application,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['application', applicationId],
    queryFn: () => getApplication(applicationId!),
    enabled: !!applicationId,

    initialData: () => {
      if (!applicationId) return undefined;

      const allAppQueries = queryClient.getQueriesData<{ pages: Array<{ items: Application[] }> }>({
        queryKey: ['applications'],
      });

      for (const [, queryData] of allAppQueries) {
        if (!queryData?.pages) continue;

        for (const page of queryData.pages) {
          const found = page.items.find((app) => app.id === applicationId);
          if (found) {
            return found;
          }
        }
      }

      return undefined;
    },

    initialDataUpdatedAt: Date.now(),
    staleTime: 1000 * 60 * 5,
  });

  return {
    application,
    isLoading,
    isError,
  };
}
