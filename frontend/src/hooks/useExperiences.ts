import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';

import {
  createExperience,
  deleteExperience,
  getExperiences,
  updateExperience,
} from '@/services/experience';
import type { Experience } from '@/types/experience';

export function useExperiences() {
  const queryClient = useQueryClient();

  const {
    data: initialExperiences,
    isLoading: isGetLoading,
    isError: isGetError,
  } = useQuery({
    queryKey: ['experiences'],
    queryFn: getExperiences,
  });

  const {
    mutateAsync: saveExperience,
    isPending: isSaveLoading,
    isError: isSaveError,
  } = useMutation({
    mutationFn: async () => {
      const createPromises = experiences.filter((e) => !e.id).map((e) => createExperience(e));

      // FIXME: This comparison is naive and will make unnecessary updates (consuming more embedding tokens)
      // Can consider using deterministic stringify or deep comparison
      const updatePromises = [];
      for (const exp of experiences) {
        if (!exp.id) continue;

        const initialExp = initialExperiences?.find((ie) => ie.id === exp.id);
        if (JSON.stringify(initialExp) !== JSON.stringify(exp)) {
          updatePromises.push(updateExperience(exp));
        }
      }

      const deletePromises =
        initialExperiences
          ?.filter((ie) => !experiences.find((e) => e.id === ie.id))
          .map((e) => deleteExperience(e.id!)) || [];

      await Promise.all([...createPromises, ...updatePromises, ...deletePromises]);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['experiences'] });
    },
  });

  const [experiences, setExperiences] = useState<Experience[]>([]);

  useEffect(() => {
    if (initialExperiences) {
      setExperiences(initialExperiences.map((exp) => ({ ...exp, isDirty: false })));
    }
  }, [initialExperiences]);

  return {
    experiences,
    isGetLoading,
    isGetError,
    saveExperience,
    isSaveLoading,
    isSaveError,
    setExperiences,
  };
}
