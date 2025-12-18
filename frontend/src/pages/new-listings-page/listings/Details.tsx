import { Button, Field, Input, TagsInput, Text, Textarea, VStack } from '@chakra-ui/react';
import { Controller, useForm } from 'react-hook-form';
import { PiCheck } from 'react-icons/pi';

import BulletInput from '@/components/custom/BulletInput';
import DisplayDate from '@/components/custom/DisplayDate';
import type { ScrapingListing } from '@/types/listing';

interface FormValues {
  title: string;
  location: string;
  description: string;
  requirements: { value: string }[];
  skills: string[];
}

export default function Details({
  listing,
  onHighlight,
  onClearHighlight,
}: {
  listing: ScrapingListing;
  onHighlight: (text: string | null) => void;
  onClearHighlight: () => void;
}) {
  const { register, handleSubmit, control } = useForm<FormValues>({
    defaultValues: {
      title: listing.title,
      location: listing.location || '',
      description: listing.description,
      requirements: listing.requirements.map((r) => ({ value: r.value })),
      skills: listing.skills.map((s) => s.value),
    },
  });

  const onSubmit = (data: FormValues) => {
    console.log(data);
  };

  return (
    <VStack
      as="form"
      onSubmit={handleSubmit(onSubmit)}
      align="stretch"
      w="lg"
      p="4"
      gap="4"
      h="full"
      borderX="1px solid"
      borderColor="border"
      overflowY="auto"
    >
      <Field.Root>
        <Field.Label>Role</Field.Label>
        <Input {...register('title')} />
      </Field.Root>

      <Field.Root>
        <Field.Label>Location</Field.Label>
        <Input {...register('location')} />
      </Field.Root>

      <Text>Posted: {listing.postedDate ? <DisplayDate date={listing.postedDate} /> : 'N/A'}</Text>

      <Controller
        control={control}
        name="skills"
        render={({ field }) => (
          <TagsInput.Root
            value={field.value}
            onValueChange={(details) => field.onChange(details.value)}
            onBlur={field.onBlur}
            disabled={field.disabled}
            editable
          >
            <TagsInput.Label>Skills</TagsInput.Label>
            <TagsInput.Control>
              <TagsInput.Items />
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
      />

      <Button type="submit">Submit</Button>
    </VStack>
  );
}
