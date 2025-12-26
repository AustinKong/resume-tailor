import { createListCollection, HStack } from '@chakra-ui/react';
import {
  Input,
  NumberInput as ChakraNumberInput,
  Portal,
  Select,
  Slider,
  Switch,
} from '@chakra-ui/react';
import { type Control, Controller, type FieldErrors, type UseFormRegister } from 'react-hook-form';

import { PasswordInput } from '@/components/ui/password-input';
import type {
  SettingsField,
  SettingsFieldBoolean,
  SettingsFieldInteger,
  SettingsFieldNumber,
  SettingsFieldString,
} from '@/types/settings';

export function FieldInput({
  field,
  section,
  fieldName,
  register,
  control,
  errors: _errors,
}: {
  field: SettingsField;
  section: string;
  fieldName: string;
  register: UseFormRegister<Record<string, unknown>>;
  control: Control<Record<string, unknown>>;
  errors: FieldErrors<Record<string, unknown>>;
}) {
  const fullName = `${section}.${fieldName}`;

  switch (field.type) {
    case 'string':
      return (
        <StringInput field={field} fullName={fullName} register={register} control={control} />
      );
    case 'number':
      return <NumberInput field={field} fullName={fullName} control={control} />;
    case 'integer':
      return <IntegerInput field={field} fullName={fullName} control={control} />;
    case 'boolean':
      return <BooleanInput field={field} fullName={fullName} control={control} />;
    default:
      return null;
  }
}

function StringInput({
  field,
  fullName,
  register,
  control,
}: {
  field: SettingsFieldString;
  fullName: string;
  register: UseFormRegister<Record<string, unknown>>;
  control: Control<Record<string, unknown>>;
}) {
  // Check if this field has an enum (should be rendered as a select)
  if (field.enum && field.enum.length > 0) {
    const options = createListCollection({
      items: field.enum.map((value) => ({
        label: value,
        value: value,
      })),
    });

    return (
      <Controller
        name={fullName}
        control={control}
        render={({ field: rhfField }) => (
          <Select.Root
            collection={options}
            value={[rhfField.value as string]}
            onValueChange={({ value }) => rhfField.onChange(value[0])}
            onInteractOutside={() => rhfField.onBlur()}
          >
            <Select.HiddenSelect />
            <Select.Control w="full">
              <Select.Trigger>
                <Select.ValueText placeholder={`Select ${field.title.toLowerCase()}`} />
              </Select.Trigger>
              <Select.IndicatorGroup>
                <Select.Indicator />
              </Select.IndicatorGroup>
            </Select.Control>
            <Portal>
              <Select.Positioner>
                <Select.Content>
                  {options.items.map((option) => (
                    <Select.Item item={option} key={option.value}>
                      {option.label}
                      <Select.ItemIndicator />
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select.Positioner>
            </Portal>
          </Select.Root>
        )}
      />
    );
  }

  return field.exposure === 'secret' ? (
    <PasswordInput w="full" {...register(fullName)} />
  ) : (
    <Input w="full" {...register(fullName)} />
  );
}

function NumberInput({
  field,
  fullName,
  control,
}: {
  field: SettingsFieldNumber;
  fullName: string;
  control: Control<Record<string, unknown>>;
}) {
  return (
    <Controller
      name={fullName}
      control={control}
      render={({ field: rhfField }) => (
        <Slider.Root
          w="full"
          name={rhfField.name}
          value={[Number(rhfField.value) || 0]}
          min={field.minimum}
          max={field.maximum}
          step={0.01}
          onValueChange={({ value }) => rhfField.onChange(value[0])}
          onFocusChange={({ focusedIndex }) => {
            if (focusedIndex !== -1) return;
            rhfField.onBlur();
          }}
        >
          <HStack justify="space-between">
            <Slider.Label color="fg.muted">{field.title}</Slider.Label>
            <Slider.ValueText />
          </HStack>
          <Slider.Control>
            <Slider.Track>
              <Slider.Range />
            </Slider.Track>
            <Slider.Thumbs />
          </Slider.Control>
        </Slider.Root>
      )}
    />
  );
}

function IntegerInput({
  field,
  fullName,
  control,
}: {
  field: SettingsFieldInteger;
  fullName: string;
  control: Control<Record<string, unknown>>;
}) {
  return (
    <Controller
      name={fullName}
      control={control}
      render={({ field: rhfField }) => (
        <ChakraNumberInput.Root
          w="full"
          name={rhfField.name}
          value={String(rhfField.value ?? '')}
          min={field.minimum}
          max={field.maximum}
          onValueChange={({ value }) => rhfField.onChange(value)}
        >
          <ChakraNumberInput.Control />
          <ChakraNumberInput.Input onBlur={rhfField.onBlur} />
        </ChakraNumberInput.Root>
      )}
    />
  );
}

function BooleanInput({
  field: _field,
  fullName,
  control,
}: {
  field: SettingsFieldBoolean;
  fullName: string;
  control: Control<Record<string, unknown>>;
}) {
  return (
    <Controller
      name={fullName}
      control={control}
      render={({ field: rhfField }) => (
        <Switch.Root
          name={rhfField.name}
          checked={!!rhfField.value}
          onCheckedChange={({ checked }) => rhfField.onChange(checked)}
          alignSelf="end"
        >
          <Switch.HiddenInput onBlur={rhfField.onBlur} />
          <Switch.Control />
        </Switch.Root>
      )}
    />
  );
}
