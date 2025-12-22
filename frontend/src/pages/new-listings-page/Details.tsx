import {
  Center,
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
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { PiBookmarkSimple, PiCheck } from 'react-icons/pi';

import BulletInput from '@/components/custom/BulletInput';
import CompanyLogo from '@/components/custom/CompanyLogo';
import { ISODateInput } from '@/components/custom/DatePickers';
import { getCompany, getDomain } from '@/constants/draftListings';
import { useListingCache } from '@/hooks/listings';
import type { GroundedItem, ListingDraft } from '@/types/listing';
import type { ISODate } from '@/utils/date';

import { useHighlight } from './reference/source/highlightContext';

interface FormValues {
  title: string;
  company: string;
  location: string;
  description: string;
  requirements: GroundedItem[];
  skills: GroundedItem[];
  postedDate: ISODate | null;
}

// Helper functions to extract data from discriminated union

const getUrl = (listing: ListingDraft): string => listing.url;

export default function Details({ listing }: { listing: ListingDraft | null }) {
  const { setHighlight, clearHighlight } = useHighlight();
  // Extract form values based on listing type
  const getFormValues = (listing: ListingDraft): FormValues => {
    switch (listing.status) {
      case 'unique':
        return {
          title: listing.listing.title,
          company: listing.listing.company,
          location: listing.listing.location || '',
          description: listing.listing.description,
          requirements: listing.listing.requirements,
          skills: listing.listing.skills,
          postedDate: listing.listing.postedDate,
        };
      case 'duplicate_url':
        return {
          title: listing.duplicateOf.title,
          company: listing.duplicateOf.company,
          location: listing.duplicateOf.location || '',
          description: listing.duplicateOf.description,
          requirements: listing.duplicateOf.skills.map((s: string) => ({ value: s, quote: null })),
          skills: listing.duplicateOf.requirements.map((r: string) => ({ value: r, quote: null })),
          postedDate: listing.duplicateOf.postedDate,
        };
      case 'duplicate_content':
        return {
          title: listing.listing.title,
          company: listing.listing.company,
          location: listing.listing.location || '',
          description: listing.listing.description,
          requirements: listing.listing.requirements,
          skills: listing.listing.skills,
          postedDate: listing.listing.postedDate,
        };
      case 'error':
        return {
          title: '',
          company: '',
          location: '',
          description: '',
          requirements: [],
          skills: [],
          postedDate: null,
        };
      case 'pending':
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
  };

  const {
    register,
    handleSubmit,
    control,
    formState: { isDirty },
    reset,
    getValues,
  } = useForm<FormValues>({
    values: listing
      ? getFormValues(listing)
      : {
          title: '',
          company: '',
          location: '',
          description: '',
          requirements: [],
          skills: [],
          postedDate: null,
        },
  });

  const { updateListing } = useListingCache();

  const onSubmit = (data: FormValues) => {
    const cleanedRequirements = data.requirements.filter((item) => item.value.trim() !== '');
    data.requirements = cleanedRequirements;
    updateListing(listing?.id || '', data as Partial<ListingDraft>);
    reset(data);
  };

  // Auto-save on unmount (switch listing)
  useEffect(() => {
    return () => {
      if (isDirty && listing) {
        updateListing(listing.id, getValues() as Partial<ListingDraft>);
      }
    };
  }, [listing, isDirty, getValues, updateListing]);

  // INFO:
  // Unique - always allow edits and allow selecting
  // Duplicate - disallow edits
  // Error - Allow edits and pasting plaintext

  if (!listing) {
    return (
      <Center h="full">
        <Text color="fg.muted">Select a listing to view details</Text>
      </Center>
    );
  }

  const isDisabled = listing.status === 'duplicate_url' || listing.status === 'duplicate_content';

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
            href={getUrl(listing)}
            variant="underline"
            fontSize="sm"
            target="_blank"
            color="fg.info"
            truncate
            display="block"
            w="full"
          >
            {getUrl(listing)}
          </ChakraLink>
        </VStack>
        <IconButton variant="ghost" type="submit" disabled={isDisabled || !isDirty}>
          {isDirty ? <PiBookmarkSimple /> : <PiCheck />}
        </IconButton>
      </HStack>

      <Field.Root disabled={isDisabled}>
        <Field.Label>Company</Field.Label>
        <Input {...register('company', { disabled: isDisabled })} />
      </Field.Root>

      <Field.Root disabled={isDisabled}>
        <Field.Label>Role</Field.Label>
        <Input {...register('title', { disabled: isDisabled })} />
      </Field.Root>

      <Field.Root disabled={isDisabled}>
        <Field.Label>Location</Field.Label>
        <Input {...register('location', { disabled: isDisabled })} />
      </Field.Root>

      <Field.Root disabled={isDisabled}>
        <Field.Label>Posted Date</Field.Label>
        <Controller
          control={control}
          name="postedDate"
          disabled={isDisabled}
          render={({ field }) => (
            <ISODateInput
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              disabled={field.disabled}
            />
          )}
        />
      </Field.Root>

      <Controller
        control={control}
        name="skills"
        disabled={isDisabled}
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
            disabled={field.disabled}
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

      <Field.Root disabled={isDisabled}>
        <Field.Label>Description</Field.Label>
        <Textarea {...register('description', { disabled: isDisabled })} autoresize resize="none" />
      </Field.Root>

      <BulletInput
        control={control}
        register={register}
        name="requirements"
        label="Requirements"
        marker={{ icon: <PiCheck />, color: 'green' }}
        onItemMouseEnter={(item) => item.quote && setHighlight(item.quote)}
        onItemMouseLeave={clearHighlight}
        disabled={isDisabled}
        defaultItem={{ value: '', quote: null }}
      />
    </VStack>
  );
}
