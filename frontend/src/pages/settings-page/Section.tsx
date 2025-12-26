import { Box, Field, Heading, Text, VStack } from '@chakra-ui/react';
import { type Control, type FieldErrors, type UseFormRegister } from 'react-hook-form';

import type { SettingsField } from '@/types/settings';

import { FieldInput } from './FieldInput';

export function Section({
  name,
  title,
  description,
  fields,
  register,
  control,
  errors,
}: {
  name: string;
  title: string;
  description: string;
  fields: [string, SettingsField][];
  register: UseFormRegister<Record<string, unknown>>;
  control: Control<Record<string, unknown>>;
  errors: FieldErrors<Record<string, unknown>>;
}) {
  if (fields.length === 0) {
    return null;
  }

  return (
    <VStack align="stretch" gap="4">
      <Box mb="4">
        <Heading size="xl" textTransform="capitalize">
          {title}
        </Heading>
        <Text textStyle="sm" color="fg.muted">
          {description}
        </Text>
      </Box>
      {fields.map(([fieldName, field]) => (
        <Field.Root
          key={fieldName}
          display="grid"
          gridTemplateColumns={{ base: '1fr', md: '1fr token(spacing.96)' }}
          gap={{ base: '4', md: '20' }}
          invalid={!!errors[`${name}.${fieldName}`]}
        >
          <Box>
            <Field.Label textStyle="md">{field.title}</Field.Label>
            <Field.HelperText color="fg.muted" textStyle="sm">
              {field.description}
            </Field.HelperText>
          </Box>
          <VStack align={{ base: 'start', md: 'end' }} w="full">
            <FieldInput
              field={field}
              section={name}
              fieldName={fieldName}
              register={register}
              control={control}
              errors={errors}
            />
            <Field.ErrorText>{errors[`${name}.${fieldName}`]?.message}</Field.ErrorText>
          </VStack>
        </Field.Root>
      ))}
    </VStack>
  );
}
