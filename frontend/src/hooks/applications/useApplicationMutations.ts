import { useMutation, useQueryClient } from '@tanstack/react-query';

import { addStatusEvent } from '@/services/applications';
import type { StatusEvent } from '@/types/application';

export function useApplicationMutations() {
  const queryClient = useQueryClient();

  const {
    mutateAsync: updateApplicationStatus,
    isPending: isUpdateLoading,
    isError: isUpdateError,
  } = useMutation({
    mutationFn: async ({
      applicationId,
      statusEvent,
    }: {
      applicationId: string;
      statusEvent: Omit<StatusEvent, 'applicationId' | 'id' | 'createdAt'>;
    }) => {
      return await addStatusEvent(applicationId, statusEvent);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
    },
  });

  return {
    updateApplicationStatus,
    isUpdateLoading,
    isUpdateError,
  };
}
