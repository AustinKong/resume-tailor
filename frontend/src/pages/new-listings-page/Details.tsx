import {
  EmptyState,
  Field,
  HStack,
  IconButton,
  Input,
  TagsInput,
  Text,
  Textarea,
  VStack,
} from '@chakra-ui/react';
import { Link as ChakraLink } from '@chakra-ui/react';
import { useCallback, useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { PiBookmarkSimple, PiBrowser, PiCheck } from 'react-icons/pi';

import { CompanyLogo } from '@/components/custom/CompanyLogo';
import { ISODateInput } from '@/components/custom/DatePickers';
import { SortableListInput } from '@/components/custom/sortable-list-input';
import { getCompany, getDomain } from '@/constants/draftListings';
import { useListingCache } from '@/hooks/listings';
import type { GroundedItem, ListingDraft } from '@/types/listing';
import type { ISODate } from '@/utils/date';

import { useHighlightSetter } from './reference/source/highlightContext';

interface FormValues {
  title: string;
  company: string;
  location: string;
  description: string;
  requirements: GroundedItem[];
  skills: GroundedItem[];
  postedDate: ISODate | null;
}

const getFormValues = (listingDraft: ListingDraft): FormValues => {
  const isDuplicateUrl = listingDraft.status === 'duplicate_url';
  if (!isDuplicateUrl && !('listing' in listingDraft)) {
    return {
      title: '',
      company: '',
      location: '',
      description: '',
      requirements: [],
      skills: [],
      postedDate: null,
    };
  }
  const data = isDuplicateUrl ? listingDraft.duplicateOf : listingDraft.listing;

  return {
    ...data,
    location: data.location || '',
    requirements: isDuplicateUrl
      ? (data.requirements as string[]).map((r) => ({ value: r, quote: null }))
      : (data.requirements as GroundedItem[]),
    skills: isDuplicateUrl
      ? (data.skills as string[]).map((s) => ({ value: s, quote: null }))
      : (data.skills as GroundedItem[]),
  };
};

export function Details({ listing }: { listing: ListingDraft | null }) {
  const { setHighlight, clearHighlight } = useHighlightSetter();

  const {
    register,
    handleSubmit,
    control,
    formState: { isDirty },
    getValues,
    reset,
  } = useForm<FormValues>({
    defaultValues: {
      title: '',
      company: '',
      location: '',
      description: '',
      requirements: [],
      skills: [],
      postedDate: null,
    },
    values: listing ? getFormValues(listing) : undefined,
  });

  const { patchListingContent } = useListingCache();

  const onSubmit = useCallback(
    (data: FormValues) => {
      if (!listing) return;
      const updatedData = {
        ...data,
        requirements: data.requirements.filter((item) => item.value.trim() !== ''),
        skills: data.skills.filter((item) => item.value.trim() !== ''),
        location: data.location || null,
      };

      patchListingContent(listing.id, updatedData);
      reset(data);
    },
    [listing, patchListingContent, reset]
  );

  const handleInputListMouseEnter = useCallback(
    (item: GroundedItem) => {
      if (item.quote) setHighlight(item.quote);
    },
    [setHighlight]
  );

  const handleInputListMouseLeave = useCallback(() => {
    clearHighlight();
  }, [clearHighlight]);

  console.log('details rerender');

  // Auto-save on unmount (switch listing)
  useEffect(() => {
    return () => {
      if (isDirty) {
        onSubmit(getValues());
      }
    };
  }, [isDirty, getValues, onSubmit]);

  if (!listing) {
    return <NoSelection />;
  }

  if (listing.status === 'pending') {
    return <Pending />;
  }

  const isReadOnly = listing.status === 'duplicate_url' || listing.status === 'duplicate_content';

  return (
    <VStack
      as="form"
      onSubmit={handleSubmit(onSubmit)}
      align="stretch"
      w="full"
      p="4"
      gap="4"
      h="full"
      overflowY="auto"
      overflowX="hidden"
    >
      <HStack gap="3" align="start">
        <CompanyLogo
          domain={getDomain(listing)}
          companyName={getCompany(listing) || '?'}
          size="xl"
        />
        <VStack alignItems="start" gap="0" flex="1" minW="0">
          <Text fontSize="xl" fontWeight="bold" lineHeight="shorter">
            {getCompany(listing)}
          </Text>
          <ChakraLink
            href={listing.url}
            variant="underline"
            fontSize="sm"
            target="_blank"
            color="fg.info"
            truncate
            display="block"
            w="full"
          >
            {listing.url}
          </ChakraLink>
        </VStack>
        <IconButton variant="ghost" type="submit" disabled={isReadOnly || !isDirty}>
          {isDirty ? <PiBookmarkSimple /> : <PiCheck />}
        </IconButton>
      </HStack>

      <Field.Root readOnly={isReadOnly}>
        <Field.Label>Company</Field.Label>
        <Input {...register('company')} />
      </Field.Root>

      <Field.Root readOnly={isReadOnly}>
        <Field.Label>Role</Field.Label>
        <Input {...register('title')} />
      </Field.Root>

      <Field.Root readOnly={isReadOnly}>
        <Field.Label>Location</Field.Label>
        <Input {...register('location')} />
      </Field.Root>

      <Field.Root readOnly={isReadOnly}>
        <Field.Label>Posted Date</Field.Label>
        <Controller
          control={control}
          name="postedDate"
          render={({ field }) => (
            <ISODateInput value={field.value} onChange={field.onChange} onBlur={field.onBlur} />
          )}
        />
      </Field.Root>

      <Controller
        control={control}
        name="skills"
        render={({ field }) => (
          <TagsInput.Root
            value={field.value.map((s) => s.value)}
            onValueChange={(details) => {
              const newValues = details.value;
              const newSkills = newValues.map((str) => {
                const existing = field.value.find((s) => s.value === str);
                return existing || { value: str, quote: null };
              });
              field.onChange(newSkills);
            }}
            onBlur={field.onBlur}
            readOnly={isReadOnly}
            editable
          >
            <TagsInput.Label>Skills</TagsInput.Label>
            <TagsInput.Control>
              {field.value.map((skill, index) => (
                <TagsInput.Item key={skill.value} index={index} value={skill.value}>
                  <TagsInput.ItemPreview
                    onMouseEnter={() => skill.quote && setHighlight(skill.quote)}
                    onMouseLeave={clearHighlight}
                  >
                    <TagsInput.ItemText>{skill.value}</TagsInput.ItemText>
                    <TagsInput.ItemDeleteTrigger />
                  </TagsInput.ItemPreview>
                  <TagsInput.ItemInput />
                </TagsInput.Item>
              ))}
              <TagsInput.Input placeholder="Add skill..." />
            </TagsInput.Control>
          </TagsInput.Root>
        )}
      />

      <Field.Root readOnly={isReadOnly}>
        <Field.Label>Description</Field.Label>
        <Textarea {...register('description')} autoresize resize="none" />
      </Field.Root>

      <SortableListInput.Root<FormValues>
        control={control}
        register={register}
        name="requirements"
        readOnly={isReadOnly}
      >
        <HStack justify="space-between">
          <SortableListInput.Label>Requirements (Sortable)</SortableListInput.Label>
          <SortableListInput.AddButton />
        </HStack>

        <SortableListInput.List>
          <SortableListInput.Item<FormValues>
            onMouseEnter={handleInputListMouseEnter}
            onMouseLeave={handleInputListMouseLeave}
          >
            <SortableListInput.Marker color="green">
              <PiCheck />
            </SortableListInput.Marker>
            <SortableListInput.Input placeholder="Enter requirement..." />
            <SortableListInput.DeleteButton />
          </SortableListInput.Item>
        </SortableListInput.List>
      </SortableListInput.Root>
    </VStack>
  );
}

function NoSelection() {
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

function Pending() {
  return (
    <EmptyState.Root h="full">
      <EmptyState.Content h="full">
        <EmptyState.Indicator>
          <PiBrowser />
        </EmptyState.Indicator>
        <VStack textAlign="center">
          <EmptyState.Title>Scraping Listing...</EmptyState.Title>
          <EmptyState.Description>
            Please wait while we fetch the listing details
          </EmptyState.Description>
        </VStack>
      </EmptyState.Content>
    </EmptyState.Root>
  );
}
