import { useMutation, useQueryClient } from '@tanstack/react-query';

import { createExperience, deleteExperience, updateExperience } from '@/services/experience';
import type { Experience } from '@/types/experience';

export function useExperienceMutations() {
  const queryClient = useQueryClient();

  const {
    mutateAsync: updateExperiences,
    isPending: isUpdateLoading,
    isError: isUpdateError,
  } = useMutation({
    mutationFn: async (experiences: Experience[]) => {
      // Get current experiences from cache to compare
      const currentExperiences = queryClient.getQueryData(['experiences']) as
        | Experience[]
        | undefined;

      const createPromises = experiences.filter((e) => !e.id).map((e) => createExperience(e));

      // FIXME: This comparison is naive and will make unnecessary updates (consuming more embedding tokens)
      // Can consider using deterministic stringify or deep comparison
      const updatePromises = [];
      for (const exp of experiences) {
        if (!exp.id) continue;

        const currentExp = currentExperiences?.find((ce) => ce.id === exp.id);
        if (JSON.stringify(currentExp) !== JSON.stringify(exp)) {
          updatePromises.push(updateExperience(exp));
        }
      }

      const deletePromises =
        currentExperiences
          ?.filter((ce) => !experiences.find((e) => e.id === ce.id))
          .map((e) => deleteExperience(e.id!)) || [];

      await Promise.all([...createPromises, ...updatePromises, ...deletePromises]);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['experiences'] });
    },
  });

  return {
    updateExperiences,
    isUpdateLoading,
    isUpdateError,
  };
}
