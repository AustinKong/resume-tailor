import { createListCollection } from '@chakra-ui/react';
import {
  Button,
  Group,
  Heading,
  HStack,
  NumberInput,
  Portal,
  Select,
  Text,
  Textarea,
  Timeline,
  VStack,
} from '@chakra-ui/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { PiCheck } from 'react-icons/pi';
import { z } from 'zod';

import DisplayDate from '@/components/custom/DisplayDate';
import { STATUS_DEFINITIONS, STATUS_OPTIONS } from '@/constants/statuses';
import { useApplicationMutations } from '@/hooks/applications';
import type { Application, StatusEnum } from '@/types/application';

const timelineSchema = z.object({
  status: z.array(z.string()).min(1, 'Status is required'),
  stage: z.number().min(0),
  notes: z.string().optional(),
});

type TimelineFormValues = z.infer<typeof timelineSchema>;

function TimelineDisplay({ timeline }: { timeline: Application['timeline'] }) {
  return (
    <Timeline.Root size="sm" variant="solid" flex="0.8" ml="1">
      {timeline.map((event) => {
        const IconComponent = STATUS_DEFINITIONS[event.status].icon;

        return (
          <Timeline.Item key={event.id}>
            <Timeline.Connector>
              <Timeline.Separator />
              <Timeline.Indicator>
                <IconComponent />
              </Timeline.Indicator>
            </Timeline.Connector>
            <Timeline.Content gap="0">
              <Timeline.Title>
                {STATUS_DEFINITIONS[event.status].label}
                {event.stage > 0 && ` ${event.stage}`}
              </Timeline.Title>
              <Timeline.Description>
                <DisplayDate date={event.createdAt} />
              </Timeline.Description>
              <Text textStyle="sm" color="fg.muted">
                {event.notes}
              </Text>
            </Timeline.Content>
          </Timeline.Item>
        );
      })}
    </Timeline.Root>
  );
}

function StatusForm({ application }: { application: Application }) {
  const { updateApplicationStatus, isUpdateLoading } = useApplicationMutations();

  const statuses = createListCollection({
    items: STATUS_OPTIONS,
  });

  const { handleSubmit, reset, watch, control, register, setValue } = useForm<TimelineFormValues>({
    resolver: zodResolver(timelineSchema),
    defaultValues: {
      status: [],
      stage: 0,
      notes: '',
    },
  });

  const onSubmit = async (data: TimelineFormValues) => {
    const statusEvent = {
      status: data.status[0] as StatusEnum,
      stage: data.stage,
      notes: data.notes || null,
    };

    await updateApplicationStatus({
      applicationId: application.id,
      statusEvent,
    });

    reset({ status: [], stage: 1, notes: '' });
  };

  const currentStatus = watch('status')?.[0];
  const isStageable = currentStatus === 'SCREENING' || currentStatus === 'INTERVIEW';
  const minStage = isStageable ? 1 : 0;
  const maxStage = isStageable ? { SCREENING: 19, INTERVIEW: 39 }[currentStatus] : 0;

  return (
    <VStack flex="1" align="stretch" as="form" onSubmit={handleSubmit(onSubmit)}>
      <Group attached>
        <Controller
          control={control}
          name="status"
          render={({ field }) => (
            <Select.Root
              name={field.name}
              value={field.value}
              onValueChange={({ value }) => {
                field.onChange(value);
                const newStatus = value[0];
                const hasStages = newStatus === 'SCREENING' || newStatus === 'INTERVIEW';
                setValue('stage', hasStages ? 1 : 0);
              }}
              onInteractOutside={() => field.onBlur()}
              collection={statuses}
            >
              <Select.HiddenSelect />
              <Select.Control>
                <Select.Trigger>
                  <Select.ValueText placeholder="Update status" />
                </Select.Trigger>
                <Select.IndicatorGroup>
                  <Select.Indicator />
                </Select.IndicatorGroup>
              </Select.Control>
              <Portal>
                <Select.Positioner>
                  <Select.Content>
                    {statuses.items.map((status) => (
                      <Select.Item item={status} key={status.value}>
                        {status.label}
                        <Select.ItemIndicator />
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select.Positioner>
              </Portal>
            </Select.Root>
          )}
        />

        <Controller
          name="stage"
          control={control}
          disabled={!isStageable}
          render={({ field }) => (
            <NumberInput.Root
              name={field.name}
              value={field.value.toString()}
              onValueChange={({ value }) => field.onChange(Number(value))}
              disabled={field.disabled}
              min={minStage}
              max={maxStage}
              w="32"
            >
              <NumberInput.Control />
              <NumberInput.Input />
            </NumberInput.Root>
          )}
        />
      </Group>

      <Textarea placeholder="Add notes" {...register('notes')} autoresize />

      <Button type="submit" disabled={!currentStatus} loading={isUpdateLoading}>
        <PiCheck /> Update Application
      </Button>
    </VStack>
  );
}

export default function TimelineEditor({ application }: { application: Application }) {
  return (
    <VStack align="stretch">
      <Heading size="md">Your Application</Heading>
      <HStack alignItems="stretch">
        <TimelineDisplay timeline={application.timeline} />
        <StatusForm application={application} />
      </HStack>
    </VStack>
  );
}
