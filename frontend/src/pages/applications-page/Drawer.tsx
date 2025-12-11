import type { ListCollection } from '@chakra-ui/react';
import {
  Box,
  Button,
  CloseButton,
  createListCollection,
  DataList,
  Group,
  Heading,
  HStack,
  Link as ChakraLink,
  List,
  NumberInput,
  Portal,
  Select,
  Separator,
  Text,
  Textarea,
  Timeline,
  VStack,
} from '@chakra-ui/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import React from 'react';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { PiCheck, PiFile } from 'react-icons/pi';
import { useNavigate } from 'react-router';
import { Link } from 'react-router';
import { z } from 'zod';

import CompanyLogo from '@/components/custom/CompanyLogo';
import { STATUS_DEFINITIONS, STATUS_OPTIONS } from '@/constants/statuses';
import { useApplicationMutations, useApplicationQuery } from '@/hooks/applications';
import { createShellResume } from '@/services/resume';
import type { StatusEnum } from '@/types/application';

const timelineSchema = z.object({
  status: z.array(z.string()).min(1, 'Status is required'),
  stage: z.number().min(0),
  notes: z.string().optional(),
});

type TimelineFormValues = z.infer<typeof timelineSchema>;

// TODO: Instead of selectedApplication being an object, make it an ID + useMemo instead so the onApplicationUpdate doesn't need to be passed into here
function TimelineEditor({
  selectedApplicationId,
  statuses,
}: {
  selectedApplicationId: string | null;
  statuses: ListCollection<{ value: StatusEnum; label: string; icon: React.ComponentType }>;
}) {
  const { application: selectedApplication } = useApplicationQuery(selectedApplicationId);
  const { updateApplicationStatus, isUpdateLoading } = useApplicationMutations();

  const { handleSubmit, reset, watch, control, register, setValue } = useForm<TimelineFormValues>({
    resolver: zodResolver(timelineSchema),
    defaultValues: {
      status: [],
      stage: 1,
      notes: '',
    },
  });

  const onSubmit = async (data: TimelineFormValues) => {
    if (!selectedApplication) return;

    const statusEvent = {
      status: data.status[0] as StatusEnum,
      stage: data.stage,
      notes: data.notes,
    };

    await updateApplicationStatus({
      applicationId: selectedApplication.id,
      statusEvent,
    });

    reset({ status: [], stage: 1, notes: '' });
  };

  const currentStatus = watch('status')?.[0];
  const isStageable = currentStatus === 'SCREENING' || currentStatus === 'INTERVIEW';
  const minStage = isStageable ? 1 : 0;
  const maxStage = isStageable ? { SCREENING: 19, INTERVIEW: 39 }[currentStatus] : 0;

  return (
    <HStack w="full" alignItems="stretch">
      <Timeline.Root size="sm" variant="solid" flex="0.8" ml="1">
        {selectedApplication?.timeline.map((event) => {
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
                  {event.status.replace('_', ' ')}
                  {event.stage > 0 && ` ${event.stage}`}
                </Timeline.Title>
                <Timeline.Description>
                  {new Date(event.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </Timeline.Description>
                {event.notes && (
                  <Text textStyle="sm" color="fg.muted" mt={1}>
                    {event.notes}
                  </Text>
                )}
              </Timeline.Content>
            </Timeline.Item>
          );
        })}
      </Timeline.Root>

      <VStack
        flex="1"
        align="stretch"
        justify="flex-start"
        as="form"
        onSubmit={handleSubmit(onSubmit)}
      >
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
                  setValue('stage', 1);
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
    </HStack>
  );
}

// TODO: This page is checking in progress.  Others withint the same folder are DONE
// FIXME: Timeline array is probably wrong
// TODO: Show a skeletong instead of the entire drawer dissapearing when selectedApplicationid is null
// Observe that rn when u collapse the drawer, it becomes blank while closing. Using skeletongs we can fix this
export default function Drawer({
  isOpen,
  onClose,
  selectedApplicationId,
}: {
  isOpen: boolean;
  onClose: () => void;
  selectedApplicationId: string | null;
}) {
  const { application } = useApplicationQuery(selectedApplicationId);
  const [isGenerating, setIsGenerating] = useState(false);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const handleGenerateResume = async () => {
    if (!application) return;
    setIsGenerating(true);
    try {
      const resume = await createShellResume(application.id);
      // Invalidate applications to update resumeId
      await queryClient.invalidateQueries({ queryKey: ['applications'] });
      // Navigate to the new resume
      navigate(`/resumes/${resume.id}`);
    } catch (error) {
      console.error('Failed to generate resume:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  // TODO: I wonder if its possible conditionally show users if they are "undoing" or "updating"
  const statuses = createListCollection({
    items: STATUS_OPTIONS,
  });

  const listingData = application
    ? [
        { label: 'Role', value: application.listing.title },
        { label: 'Location', value: application.listing.location },
        { label: 'Posted', value: application.listing.postedDate },
        { label: 'Skills', value: application.listing.skills.join(', ') },
      ]
    : [];

  return (
    <Box
      h="full"
      w={isOpen ? 'lg' : '0'}
      transitionProperty="width"
      transitionDuration="moderate"
      transitionTimingFunction="ease-out"
      overflow="hidden"
      borderLeft={isOpen ? '1px solid' : 'none'}
      borderColor="border"
      bg="bg.panel"
      overflowY="auto"
    >
      {/* Need to do this weird asf thing to make it animate properly */}
      {application && (
        <VStack w="lg" p={4} alignItems="stretch" gap="4">
          <HStack gap="3" alignItems="start">
            <CompanyLogo
              domain={application.listing.domain}
              companyName={application.listing.company}
              size="xl"
            />
            <VStack alignItems="start" gap="0" flex="1">
              <Text fontSize="xl" fontWeight="bold" lineHeight="shorter">
                {application.listing.company}
              </Text>
              <ChakraLink
                href={application.listing.url}
                variant="underline"
                fontSize="sm"
                target="_blank"
                color="fg.info"
              >
                {application.listing.url}
              </ChakraLink>
            </VStack>
            <CloseButton onClick={onClose} size="sm" />
          </HStack>

          <VStack align="stretch">
            <Heading size="md">About the Role</Heading>
            <DataList.Root orientation="horizontal" w="full" gap="2" size="lg">
              {listingData.map((item) => (
                <DataList.Item key={item.label}>
                  <DataList.ItemLabel>{item.label}</DataList.ItemLabel>
                  <DataList.ItemValue>{item.value}</DataList.ItemValue>
                </DataList.Item>
              ))}
            </DataList.Root>
          </VStack>

          <VStack align="stretch">
            <Heading size="md">Description</Heading>
            <Text color="fg.muted">{application.listing.description}</Text>
          </VStack>

          <VStack align="stretch">
            <Heading size="md">Requirements</Heading>
            <List.Root variant="plain">
              {application.listing.requirements.map((req, index) => (
                <List.Item key={index}>
                  <List.Indicator asChild color="green">
                    <PiCheck />
                  </List.Indicator>
                  <Text color="fg.muted">{req}</Text>
                </List.Item>
              ))}
            </List.Root>
          </VStack>

          <Separator />

          <VStack align="stretch">
            <Heading size="md">Your Application</Heading>
            <TimelineEditor selectedApplicationId={application?.id ?? null} statuses={statuses} />
            {application.resumeId ? (
              <Button asChild mt="4">
                <Link to={`resumes/${application.resumeId}`}>
                  <PiFile /> Resume
                </Link>
              </Button>
            ) : (
              <Button mt="4" onClick={handleGenerateResume} loading={isGenerating}>
                <PiFile /> Generate Resume
              </Button>
            )}
            <Button asChild disabled>
              <Link to={`/404`}>
                <PiFile /> Cover Letter
              </Link>
            </Button>
          </VStack>
        </VStack>
      )}
    </Box>
  );
}
