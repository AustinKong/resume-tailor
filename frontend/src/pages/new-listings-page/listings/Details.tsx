import { Button, Field, HStack, Input, TagsInput, Text, Textarea, VStack } from '@chakra-ui/react';
import { Link as ChakraLink } from '@chakra-ui/react';
import { Controller, useForm } from 'react-hook-form';
import { PiCheck } from 'react-icons/pi';

import BulletInput from '@/components/custom/BulletInput';
import CompanyLogo from '@/components/custom/CompanyLogo';
import { ISODateInput } from '@/components/custom/DatePickers';
import type { GroundedItem, ScrapingListing } from '@/types/listing';
import type { ISODate } from '@/utils/date';

interface FormValues {
  title: string;
  company: string;
  location: string;
  description: string;
  requirements: GroundedItem[];
  skills: GroundedItem[];
  postedDate: ISODate | null;
}

export default function Details({
  listing,
  onHighlight: _onHighlight,
  onClearHighlight: _onClearHighlight,
}: {
  listing: ScrapingListing;
  onHighlight: (text: string | null) => void;
  onClearHighlight: () => void;
}) {
  const { register, handleSubmit, control } = useForm<FormValues>({
    defaultValues: {
      title: listing.title,
      company: listing.company,
      location: listing.location || '',
      description: listing.description,
      requirements: listing.requirements,
      skills: listing.skills,
      postedDate: listing.postedDate,
    },
  });
  console.log(listing);

  const onSubmit = (data: FormValues) => {
    console.log(data);
  };

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
        <CompanyLogo domain={listing.domain} companyName={listing.company} size="xl" />
        <VStack alignItems="start" gap="0" flex="1">
          <Text fontSize="xl" fontWeight="bold" lineHeight="shorter">
            {listing.company}
          </Text>
          <ChakraLink
            href={listing.url}
            variant="underline"
            fontSize="sm"
            target="_blank"
            color="fg.info"
          >
            {listing.url}
          </ChakraLink>
        </VStack>
      </HStack>

      <Field.Root>
        <Field.Label>Role</Field.Label>
        <Input {...register('title')} />
      </Field.Root>

      <Field.Root>
        <Field.Label>Company</Field.Label>
        <Input {...register('company')} />
      </Field.Root>

      <Field.Root>
        <Field.Label>Location</Field.Label>
        <Input {...register('location')} />
      </Field.Root>

      <Field.Root>
        <Field.Label>Posted Date</Field.Label>
        <Controller
          control={control}
          name="postedDate"
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
                    onMouseEnter={() => skill.quote && _onHighlight(skill.quote)}
                    onMouseLeave={_onClearHighlight}
                  >
                    <TagsInput.ItemText>{skill.value}</TagsInput.ItemText>
                    <TagsInput.ItemDeleteTrigger />
                  </TagsInput.ItemPreview>
                  <TagsInput.ItemInput />
                </TagsInput.Item>
              ))}
              <TagsInput.Input placeholder="Add tag..." />
            </TagsInput.Control>
          </TagsInput.Root>
        )}
      />

      <Field.Root>
        <Field.Label>Description</Field.Label>
        <Textarea {...register('description')} autoresize />
      </Field.Root>

      <BulletInput
        control={control}
        register={register}
        name="requirements"
        label="Requirements"
        marker={{ icon: <PiCheck />, color: 'green' }}
        onItemMouseEnter={(item) => item.quote && _onHighlight(item.quote)}
        onItemMouseLeave={_onClearHighlight}
      />

      <Button type="submit">Submit</Button>
    </VStack>
  );
}
