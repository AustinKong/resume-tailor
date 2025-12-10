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
import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import {
  PiArrowLeft,
  PiBookmarkSimple,
  PiCheck,
  PiCheckCircle,
  PiEye,
  PiFile,
  PiGhost,
  PiHandHeart,
  PiMicrophone,
  PiPaperPlaneTilt,
  PiX,
  PiXCircle,
} from 'react-icons/pi';
import { Link } from 'react-router';

import CompanyLogo from '@/components/custom/CompanyLogo';
import { addStatusEvent } from '@/services/applications';
import type { Application, StatusEnum } from '@/types/application';
import type { ISODatetime } from '@/utils/date';

interface ApplicationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  selectedApplication: Application | null;
  onApplicationUpdate?: (application: Application) => void;
}

function getStatusIcon(status: StatusEnum) {
  const iconMap = {
    SAVED: PiBookmarkSimple,
    APPLIED: PiPaperPlaneTilt,
    SCREENING: PiEye,
    INTERVIEW: PiMicrophone,
    OFFER_RECEIVED: PiHandHeart,
    ACCEPTED: PiCheckCircle,
    REJECTED: PiXCircle,
    GHOSTED: PiGhost,
    WITHDRAWN: PiArrowLeft,
    RESCINDED: PiX,
  };
  return iconMap[status];
}

// FIXME: Timeline array is probably wrong
export default function ApplicationDrawer({
  isOpen,
  onClose,
  selectedApplication,
  onApplicationUpdate,
}: ApplicationDrawerProps) {
  const [selectedStatus, setSelectedStatus] = useState<string[]>([]);
  const [notes, setNotes] = useState<string>('');
  const [stage, setStage] = useState<string>('1');
  const queryClient = useQueryClient();

  const handleUpdate = async () => {
    if (!selectedApplication || !selectedStatus.length) return;

    const statusEvent = {
      // FIXME: Weird how uuid generation is done client side
      id: crypto.randomUUID(),
      status: selectedStatus[0] as StatusEnum,
      stage: parseInt(stage) || 0,
      // FIXME: Same for client side date generation
      createdAt: new Date().toISOString() as ISODatetime,
      notes: notes || undefined,
    };

    try {
      const updatedApplication = await addStatusEvent(selectedApplication.id, statusEvent);
      // Invalidate and refetch applications query
      await queryClient.invalidateQueries({ queryKey: ['applications'] });
      // Update the selected application in the parent component
      onApplicationUpdate?.(updatedApplication);
      // Clear the input fields
      setSelectedStatus([]);
      setNotes('');
      setStage('1');
    } catch (error) {
      console.error('Failed to update application:', error);
      // TODO: Show error message
    }
  };

  // TODO: I wonder if its possible conditionally show users if they are "undoing" or "updating"
  const statuses = createListCollection({
    items: [
      { label: 'Saved', value: 'SAVED' },
      { label: 'Applied', value: 'APPLIED' },
      { label: 'Screening', value: 'SCREENING' },
      { label: 'Interview', value: 'INTERVIEW' },
      { label: 'Offer Received', value: 'OFFER_RECEIVED' },
      { label: 'Accepted', value: 'ACCEPTED' },
      { label: 'Rejected', value: 'REJECTED' },
      { label: 'Ghosted', value: 'GHOSTED' },
      { label: 'Withdrawn', value: 'WITHDRAWN' },
      { label: 'Rescinded', value: 'RESCINDED' },
    ],
  });

  return (
    <Box
      w={isOpen ? 'lg' : '0'}
      transitionProperty="width"
      transitionDuration="slow"
      transitionTimingFunction="ease-out"
      overflow="hidden"
      borderLeft={isOpen ? '1px solid' : 'none'}
      borderColor="border"
      bg="bg.panel"
      overflowY="auto"
    >
      {/* Need to do this weird asf thing to make it animate properly */}
      {selectedApplication && (
        <VStack w="lg" p={4} alignItems="stretch" gap="4">
          <HStack gap="3" alignItems="start">
            <CompanyLogo
              domain={selectedApplication.listing.domain}
              companyName={selectedApplication.listing.company}
              size="xl"
            />
            <VStack alignItems="start" gap="0" flex="1">
              <Text fontSize="xl" fontWeight="bold" lineHeight="shorter">
                {selectedApplication.listing.company}
              </Text>
              <ChakraLink
                href={selectedApplication.listing.url}
                variant="underline"
                fontSize="sm"
                target="_blank"
                color="fg.info"
              >
                {selectedApplication.listing.url}
              </ChakraLink>
            </VStack>
            <CloseButton onClick={onClose} size="sm" />
          </HStack>

          <VStack align="stretch">
            <Heading size="md">About the Role</Heading>
            <DataList.Root orientation="horizontal" w="full" gap="2" size="lg">
              <DataList.Item>
                <DataList.ItemLabel>Role</DataList.ItemLabel>
                <DataList.ItemValue>{selectedApplication.listing.title}</DataList.ItemValue>
              </DataList.Item>
              <DataList.Item>
                <DataList.ItemLabel>Location</DataList.ItemLabel>
                <DataList.ItemValue>{selectedApplication.listing.location}</DataList.ItemValue>
              </DataList.Item>
              <DataList.Item>
                <DataList.ItemLabel>Posted</DataList.ItemLabel>
                <DataList.ItemValue>{selectedApplication.listing.postedDate}</DataList.ItemValue>
              </DataList.Item>
              <DataList.Item>
                <DataList.ItemLabel>Skills</DataList.ItemLabel>
                <DataList.ItemValue>
                  {selectedApplication.listing.skills.join(', ')}
                </DataList.ItemValue>
              </DataList.Item>
              {/* <DataList.Item>
                <DataList.ItemLabel>Status</DataList.ItemLabel>
                <DataList.ItemValue>
                  <StatusBadge
                    status={selectedApplication.currentStatus}
                    stage={selectedApplication.currentStage}
                  />
                </DataList.ItemValue>
              </DataList.Item> */}
            </DataList.Root>
          </VStack>

          <VStack align="stretch">
            <Heading size="md">Description</Heading>
            <Text color="fg.muted">{selectedApplication.listing.description}</Text>
          </VStack>

          <VStack align="stretch">
            <Heading size="md">Requirements</Heading>
            <List.Root variant="plain">
              {selectedApplication.listing.requirements.map((req, index) => (
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
            <HStack w="full" alignItems="stretch">
              {/* TODO: Update status */}
              <Timeline.Root size="sm" variant="solid" flex="0.8" ml="1">
                {selectedApplication.statusEvents
                  .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
                  .map((event) => {
                    const IconComponent = getStatusIcon(event.status);

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
              <VStack flex="1" align="stretch" justify="flex-start">
                <Group attached>
                  <Select.Root
                    collection={statuses}
                    value={selectedStatus}
                    onValueChange={(e) => setSelectedStatus(e.value)}
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
                  <NumberInput.Root
                    value={stage}
                    onValueChange={(e) => setStage(e.value)}
                    disabled={
                      !selectedStatus.length ||
                      (selectedStatus[0] !== 'SCREENING' && selectedStatus[0] !== 'INTERVIEW')
                    }
                    min={
                      selectedStatus[0] === 'SCREENING' || selectedStatus[0] === 'INTERVIEW' ? 1 : 0
                    }
                    max={
                      selectedStatus[0] === 'SCREENING'
                        ? 19
                        : selectedStatus[0] === 'INTERVIEW'
                          ? 39
                          : 1
                    }
                    w="32"
                  >
                    <NumberInput.Control />
                    <NumberInput.Input />
                  </NumberInput.Root>
                </Group>
                {/* TODO: Disabled until selected a status */}
                <Textarea
                  placeholder="Add notes"
                  autoresize
                  disabled={!selectedStatus.length}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
                <Button disabled={!selectedStatus.length} onClick={handleUpdate}>
                  <PiCheck /> Update Application
                </Button>
              </VStack>
            </HStack>
            <Button asChild mt="4">
              <Link to={`resumes/${selectedApplication.resumeId}`}>
                <PiFile /> Resume
              </Link>
            </Button>
            <Button asChild>
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
