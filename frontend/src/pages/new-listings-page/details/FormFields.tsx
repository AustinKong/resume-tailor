import { Field, HStack, Input, TagsInput, Textarea } from '@chakra-ui/react';
import { useCallback } from 'react';
import { type Control, Controller, type UseFormRegister } from 'react-hook-form';
import { PiCheck } from 'react-icons/pi';

import { ISODateInput } from '@/components/custom/DatePickers';
import { SortableListInput } from '@/components/custom/sortable-list-input';
import type { GroundedItem } from '@/types/listing';

import { useHighlightSetter } from '../reference/source';
import type { FormValues } from '.';

export function FormFields({
  control,
  register,
  isReadOnly,
}: {
  control: Control<FormValues>;
  register: UseFormRegister<FormValues>;
  isReadOnly: boolean;
}) {
  const { setHighlight, clearHighlight } = useHighlightSetter();

  const handleReferenceHover = useCallback(
    (item: GroundedItem) => {
      if (item.quote) setHighlight(item.quote);
    },
    [setHighlight]
  );

  const handleReferenceLeave = useCallback(() => {
    clearHighlight();
  }, [clearHighlight]);

  return (
    <>
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
            value={field.value.map((s: GroundedItem) => s.value)}
            onValueChange={(details) => {
              const newValues = details.value;
              const newSkills = newValues.map((str) => {
                const existing = field.value.find((s: GroundedItem) => s.value === str);
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
              {field.value.map((skill: GroundedItem, index: number) => (
                <TagsInput.Item key={skill.value} index={index} value={skill.value}>
                  <TagsInput.ItemPreview
                    onMouseEnter={() => handleReferenceHover(skill)}
                    onMouseLeave={handleReferenceLeave}
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
          <SortableListInput.Label>Requirements</SortableListInput.Label>
          <SortableListInput.AddButton />
        </HStack>

        <SortableListInput.List>
          <SortableListInput.Item<FormValues>
            onMouseEnter={handleReferenceHover}
            onMouseLeave={handleReferenceLeave}
          >
            <SortableListInput.Marker color="green">
              <PiCheck />
            </SortableListInput.Marker>
            <SortableListInput.Input placeholder="Enter requirement..." />
            <SortableListInput.DeleteButton />
          </SortableListInput.Item>
        </SortableListInput.List>
      </SortableListInput.Root>
    </>
  );
}
