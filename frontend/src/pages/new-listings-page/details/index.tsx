import { EmptyState, VStack } from '@chakra-ui/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCallback, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { PiBrowser } from 'react-icons/pi';
import z from 'zod';

import { useListingDraftMutations } from '@/hooks/listings';
import type {
  GroundedItem,
  ListingDraft,
  ListingDraftError,
  ListingDraftPending,
} from '@/types/listing';
import type { ISODate } from '@/utils/date';

import { FormFields } from './FormFields';
import { Header } from './Header';

const groundedItemSchema = z.object({
  value: z.string(),
  quote: z.string().nullable(),
});

const detailsSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  company: z.string().min(1, 'Company is required'),
  location: z.string(),
  description: z.string(),
  requirements: z.array(groundedItemSchema),
  skills: z.array(groundedItemSchema),
  postedDate: z.custom<ISODate | null>((val) => val === null || typeof val === 'string'),
});

export type FormValues = z.infer<typeof detailsSchema>;

export function Details({ listingDraft }: { listingDraft: ListingDraft | null }) {
  if (!listingDraft) {
    return (
      <EmptyState.Root h="full">
        <EmptyState.Content h="full">
          <EmptyState.Indicator>
            <PiBrowser />
          </EmptyState.Indicator>
          <VStack textAlign="center">
            <EmptyState.Title>No Listing Selected</EmptyState.Title>
            <EmptyState.Description>
              Select a listing from the list to view its details and source
            </EmptyState.Description>
          </VStack>
        </EmptyState.Content>
      </EmptyState.Root>
    );
  }

  // TODO: Split into ifs, or merge all three
  if (listingDraft.status === 'pending' || listingDraft.status === 'error') {
    return (
      <EmptyState.Root h="full">
        <EmptyState.Content h="full">
          <EmptyState.Indicator>
            <PiBrowser />
          </EmptyState.Indicator>
          <VStack textAlign="center">
            <EmptyState.Title>
              {listingDraft.status === 'pending'
                ? 'Listing is being scraped'
                : 'Error loading listing'}
            </EmptyState.Title>
            <EmptyState.Description>
              {listingDraft.status === 'pending'
                ? 'Please wait while we fetch the listing details'
                : listingDraft.error || 'An error occurred while loading the listing'}
            </EmptyState.Description>
          </VStack>
        </EmptyState.Content>
      </EmptyState.Root>
    );
  }

  return <DetailsForm listingDraft={listingDraft} />;
}

function DetailsForm({
  listingDraft,
}: {
  listingDraft: Exclude<ListingDraft, ListingDraftPending | ListingDraftError>;
}) {
  const { patchListingDraftContent } = useListingDraftMutations();

  const {
    register,
    handleSubmit,
    control,
    formState: { isDirty },
    getValues,
    reset,
  } = useForm<FormValues>({
    resolver: zodResolver(detailsSchema),
    values: getInitialValues(listingDraft),
  });

  const onSubmit = useCallback(
    (data: FormValues) => {
      const payload = {
        ...data,
        requirements: data.requirements.filter((r) => r.value.trim()),
        skills: data.skills.filter((s) => s.value.trim()),
      };
      patchListingDraftContent(listingDraft.id, payload);
      reset(data);
    },
    [listingDraft.id, patchListingDraftContent, reset]
  );

  useEffect(() => {
    return () => {
      if (isDirty) onSubmit(getValues());
    };
  }, [isDirty, getValues, onSubmit]);

  const isReadOnly = listingDraft.status === 'duplicate_url';

  return (
    <VStack
      as="form"
      onSubmit={handleSubmit(onSubmit)}
      align="stretch"
      p="4"
      gap="4"
      h="full"
      overflowY="auto"
      overflowX="hidden"
    >
      <Header listingDraft={listingDraft} isReadOnly={isReadOnly} isDirty={isDirty} />
      <FormFields register={register} control={control} isReadOnly={isReadOnly} />
    </VStack>
  );
}

function getInitialValues(
  draft: Exclude<ListingDraft, ListingDraftPending | ListingDraftError>
): FormValues {
  const data = draft.status === 'duplicate_url' ? draft.duplicateOf : draft.listing;

  // Because duplicate_of field doesn't have 'quote' in grounded items
  const normalizeGroundedItems = (items: string[] | GroundedItem[]): GroundedItem[] =>
    items.map((item) => (typeof item === 'string' ? { value: item, quote: null } : item));

  return {
    title: data.title,
    company: data.company,
    location: data.location ?? '',
    description: data.description,
    requirements: normalizeGroundedItems(data.requirements),
    skills: normalizeGroundedItems(data.skills),
    postedDate: data.postedDate,
  };
}
