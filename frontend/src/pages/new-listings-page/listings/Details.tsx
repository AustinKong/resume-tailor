import 'react-datepicker/dist/react-datepicker.css';

import { Button, Field, Input, TagsInput, Textarea, VStack } from '@chakra-ui/react';
import { Controller, useForm } from 'react-hook-form';
import { PiCheck } from 'react-icons/pi';

import BulletInput from '@/components/custom/BulletInput';
import DatePicker from '@/components/custom/DatePicker';
import type { ScrapingListing } from '@/types/listing';

interface FormValues {
  title: string;
  location: string;
  description: string;
  requirements: { value: string }[];
  skills: string[];
  postedDate: Date | null;
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
      location: listing.location || '',
      description: listing.description,
      requirements: listing.requirements.map((r) => ({ value: r.value })),
      skills: listing.skills.map((s) => s.value),
      postedDate: listing.postedDate ? new Date(listing.postedDate) : null,
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

      <Controller
        name="postedDate"
        control={control}
        render={({ field }) => (
          <DatePicker
            selected={field.value}
            onChange={(date) => field.onChange(date)}
            colorPalette="blue"
          />
        )}
      />

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
