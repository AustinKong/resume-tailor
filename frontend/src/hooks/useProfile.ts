import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';

import { getProfile, updateProfile } from '@/services/profile';
import { emptyProfile, type Profile } from '@/types/profile';

export function useProfile() {
  const queryClient = useQueryClient();

  const {
    data: initial,
    isLoading: isGetLoading,
    isError: isGetError,
  } = useQuery({
    queryKey: ['profile'],
    queryFn: getProfile,
  });

  const {
    mutateAsync: saveProfile,
    isPending: isSaveLoading,
    isError: isSaveError,
  } = useMutation({
    mutationFn: async () => {
      return updateProfile(profile);
    },
    onSuccess: (updated) => {
      queryClient.setQueryData(['profile'], updated);
      setProfile(updated);
    },
  });

  const [profile, setProfile] = useState<Profile>(emptyProfile);

  useEffect(() => {
    if (initial) {
      setProfile(initial);
    }
  }, [initial]);

  function setProfileField(updates: Partial<Profile>) {
    setProfile((prev) => ({ ...prev, ...updates }));
  }

  return {
    profile,
    isGetLoading,
    isGetError,
    saveProfile,
    isSaveLoading,
    isSaveError,
    setProfile,
    setProfileField,
  };
}
