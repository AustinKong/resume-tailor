import { useMutation, useQueryClient } from '@tanstack/react-query';

import { updateProfile as updateProfileSvc } from '@/services/profile';
import type { Profile } from '@/types/profile';

export function useProfileMutations() {
  const queryClient = useQueryClient();

  const {
    mutateAsync: updateProfile,
    isPending: isUpdateLoading,
    isError: isUpdateError,
  } = useMutation({
    mutationFn: async (updatedProfile: Profile) => {
      return await updateProfileSvc(updatedProfile);
    },
    onSuccess: (updated) => {
      queryClient.setQueryData(['profile'], updated);
    },
  });

  return {
    updateProfile,
    isUpdateLoading,
    isUpdateError,
  };
}
