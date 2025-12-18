import { useMutation, useQueryClient } from '@tanstack/react-query';

import { scrapeListings as scrapeListingsSvc } from '@/services/listings';

export function useListingMutations() {
  const queryClient = useQueryClient();

  const {
    mutateAsync: scrapeListings,
    isPending: isScrapeLoading,
    isError: isScrapeError,
  } = useMutation({
    mutationFn: scrapeListingsSvc,
    onSuccess: (data) => {
      queryClient.setQueryData(['listings'], data);
    },
  });

  const {
    mutateAsync: saveListings,
    isPending: isSaveLoading,
    isError: isSaveError,
  } = useMutation({
    mutationFn: async (listings: string) => {
      return Promise.resolve();
    },
  });

  return {
    scrapeListings,
    isScrapeLoading,
    isScrapeError,
    saveListings,
    isSaveLoading,
    isSaveError,
  };
}
