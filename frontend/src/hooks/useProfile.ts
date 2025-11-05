import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { getProfile, updateProfile as updateProfileSvc } from '@/services/profile';

export function useProfile() {
  const queryClient = useQueryClient();

  const {
    data: profile,
    isLoading: isGetLoading,
    isError: isGetError,
  } = useQuery({
    queryKey: ['profile'],
    queryFn: getProfile,
  });

  const {
    mutateAsync: updateProfile,
    isPending: isUpdateLoading,
    isError: isUpdateError,
  } = useMutation({
    mutationFn: updateProfileSvc,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });

  return {
    profile,
    isGetLoading,
    isGetError,
    isUpdateLoading,
    isUpdateError,
    updateProfile,
  };
}
