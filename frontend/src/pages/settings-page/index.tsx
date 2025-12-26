import { Box, Center, Separator, Spinner, VStack } from '@chakra-ui/react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import React from 'react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { toaster } from '@/components/ui/toaster';
import { getSettings, updateSettings } from '@/services/settings';
import type { SettingsSection } from '@/types/settings';

import { Section } from './Section';
import { Toolbar } from './Toolbar';

export function SettingsPage() {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const queryClient = useQueryClient();
  const { data: settings, isLoading } = useQuery<Record<string, SettingsSection>>({
    queryKey: ['settings'],
    queryFn: getSettings,
  });

  const updateSettingsMutation = useMutation({
    mutationFn: updateSettings,
    onSuccess: (updatedSettings) => {
      queryClient.setQueryData(['settings'], updatedSettings);
      toaster.create({ title: 'Settings updated successfully', type: 'success' });
    },
    onError: () => {
      toaster.create({ title: 'Failed to update settings', type: 'error' });
    },
  });

  // Flatten settings for useForm defaultValues
  const defaultValues = React.useMemo(() => {
    if (!settings) return {};
    const result: Record<string, unknown> = {};
    Object.entries(settings).forEach(([section, sectionData]) => {
      Object.entries(sectionData.fields).forEach(([fieldName, field]) => {
        result[`${section}.${fieldName}`] = field.value;
      });
    });
    return result;
  }, [settings]);

  const visibleSections = React.useMemo(() => {
    if (!settings) return [];

    return Object.entries(settings)
      .map(([sectionName, sectionData]) => {
        const fields = Object.entries(sectionData.fields).filter(
          ([, field]) =>
            field.exposure === 'normal' ||
            field.exposure === 'secret' ||
            (field.exposure === 'advanced' && showAdvanced)
        );

        return {
          id: sectionName,
          title: sectionData.title,
          description: sectionData.description,
          fields,
        };
      })
      .filter((section) => section.fields.length > 0);
  }, [settings, showAdvanced]);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isDirty, dirtyFields },
  } = useForm<Record<string, unknown>>({
    values: defaultValues,
  });

  const onSubmit = handleSubmit(async (data) => {
    const dirtyData: Record<string, unknown> = {};
    Object.keys(dirtyFields).forEach((key) => {
      if (dirtyFields[key]) {
        dirtyData[key] = data[key];
      }
    });

    await updateSettingsMutation.mutateAsync(dirtyData);
  });

  if (isLoading || !settings) {
    return (
      <Center w="full" h="full">
        <Spinner />
      </Center>
    );
  }

  return (
    <VStack h="full" w="full" as="form" align="stretch" onSubmit={onSubmit} gap="0">
      <Toolbar
        showAdvanced={showAdvanced}
        onShowAdvancedChange={setShowAdvanced}
        isDirty={isDirty}
        isLoading={updateSettingsMutation.isPending}
      />
      <Box overflowY="auto">
        <VStack
          gap="12"
          p="8"
          maxW={{ base: 'full', md: 'breakpoint-md', lg: 'breakpoint-lg' }}
          w="full"
          align="stretch"
        >
          {visibleSections.map((section, index) => (
            <React.Fragment key={section.id}>
              <Section
                name={section.id}
                title={section.title}
                description={section.description}
                fields={section.fields}
                register={register}
                control={control}
                errors={errors}
              />
              {index < visibleSections.length - 1 && <Separator w="full" />}
            </React.Fragment>
          ))}
        </VStack>
      </Box>
    </VStack>
  );
}
