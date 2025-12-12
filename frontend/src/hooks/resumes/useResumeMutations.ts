import { useMutation, useQueryClient } from '@tanstack/react-query';

import { createShellResume } from '@/services/resume';

export function useResumeMutations() {
  const queryClient = useQueryClient();

  const {
    mutateAsync: createResume,
    isPending: isCreateLoading,
    isError: isCreateError,
  } = useMutation({
    mutationFn: async (applicationId: string) => {
      return await createShellResume(applicationId);
    },
    onSuccess: (_data, applicationId) => {
      // Don't need to invalidate all resumes because all resumes table doesn't display resumes anyway
      queryClient.invalidateQueries({ queryKey: ['application', applicationId] });
    },
  });

  return {
    createResume,
    isCreateLoading,
    isCreateError,
  };
}
