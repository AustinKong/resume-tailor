import {
  Collapsible,
  createListCollection,
  Heading,
  HStack,
  Input,
  Progress,
  Select,
  Spacer,
  Text,
  Textarea,
  Timeline,
  VStack,
} from '@chakra-ui/react';
import { PiCalendarBlank, PiCaretDown, PiPencilSimple, PiPlus } from 'react-icons/pi';

import { DisplayDate } from '@/components/custom/DisplayDate';
import { STATUS_DEFINITIONS, STATUS_OPTIONS } from '@/constants/statuses';
import type { Application, StatusEnum } from '@/types/application';

// Can add color as well. Then move to constants
const STAGE_TO_PROGRESS_MAP: Record<StatusEnum, number> = {
  SAVED: 0,
  APPLIED: 25,
  SCREENING: 50,
  INTERVIEW: 75,
  OFFER_RECEIVED: 100,
  ACCEPTED: 100,
  REJECTED: 100,
  GHOSTED: 100,
  WITHDRAWN: 100,
  RESCINDED: 100,
};

// FIXME: Ponder, do we want to make another get request instead of passing from parent?
export function Application({ application }: { application: Application }) {
  const statusCollection = createListCollection({
    items: STATUS_OPTIONS,
  });
  return (
    <VStack px="4" align="stretch" gap="4">
      <Progress.Root
        size="xs"
        value={STAGE_TO_PROGRESS_MAP[application.currentStatus]}
        colorPalette="green"
      >
        <Progress.Label as={HStack}>
          <Text>
            {`${application.currentStatus} ${application.currentStage > 0 ? application.currentStage : ''} - ${STAGE_TO_PROGRESS_MAP[application.currentStatus]}%`}
          </Text>
          <Spacer />
          <Text color="fg.muted">
            {['REJECTED', 'GHOSTED', 'WITHDRAWN', 'RESCINDED'].includes(application.currentStatus)
              ? 'Closed'
              : 'Active'}
          </Text>
          <HStack>{/* What to put here */}</HStack>
        </Progress.Label>
        <Progress.Track mt="1" rounded="full">
          <Progress.Range />
        </Progress.Track>
        <HStack mt="2" gap="3" fontSize="xs" color="fg.muted">
          <Text>{application.statusEvents.length} updates</Text>
          <Spacer />
          <HStack gap="1">
            <PiCalendarBlank />
            <Text>Applied: </Text>
            <DisplayDate
              date={application.timeline[0].createdAt}
              options={{ month: 'short', day: 'numeric' }}
            />
          </HStack>
          <HStack gap="0.5">
            <PiPencilSimple />
            <Text>Updated:</Text>
            <DisplayDate
              date={application.timeline[application.timeline.length - 1].createdAt}
              options={{ month: 'short', day: 'numeric' }}
            />
          </HStack>
        </HStack>
      </Progress.Root>

      <VStack align="stretch">
        <Heading size="md">Timeline</Heading>
        <Timeline.Root size="xl">
          {application.timeline.map((event) => {
            const Icon = STATUS_DEFINITIONS[event.status].icon;

            return (
              <Timeline.Item key={event.id}>
                <Timeline.Connector>
                  <Timeline.Separator />
                  <Timeline.Indicator colorPalette={STATUS_DEFINITIONS[event.status].colorPalette}>
                    <Icon />
                  </Timeline.Indicator>
                </Timeline.Connector>
                <Timeline.Content>
                  <Collapsible.Root>
                    <HStack>
                      <VStack align="start">
                        <Timeline.Title>{STATUS_DEFINITIONS[event.status].label}</Timeline.Title>
                        <Timeline.Description>
                          <DisplayDate date={event.createdAt} />
                        </Timeline.Description>
                      </VStack>
                      {event.notes && (
                        <Collapsible.Trigger alignItems="center" mt="1">
                          <Collapsible.Indicator>
                            <PiCaretDown />
                          </Collapsible.Indicator>
                        </Collapsible.Trigger>
                      )}
                    </HStack>
                    <Collapsible.Content>
                      <Text textStyle="sm" mt="2">
                        {event.notes ? event.notes : 'No additional notes provided.'}
                      </Text>
                    </Collapsible.Content>
                  </Collapsible.Root>
                </Timeline.Content>
              </Timeline.Item>
            );
          })}
          <Timeline.Item>
            <Timeline.Connector>
              <Timeline.Separator />
              <Timeline.Indicator colorPalette="blue">
                <PiPlus />
              </Timeline.Indicator>
            </Timeline.Connector>
            <Timeline.Content gap="0">
              <Timeline.Title>
                <Select.Root collection={statusCollection} size="sm">
                  <Select.HiddenSelect />
                  <Select.Control>
                    <Select.Trigger>
                      <Select.ValueText placeholder="Select status" />
                    </Select.Trigger>
                    <Select.IndicatorGroup>
                      <Select.Indicator />
                    </Select.IndicatorGroup>
                  </Select.Control>
                  <Select.Positioner>
                    <Select.Content>
                      {statusCollection.items.map((status) => (
                        <Select.Item item={status} key={status.value}>
                          {status.label}
                          <Select.ItemIndicator />
                        </Select.Item>
                      ))}
                    </Select.Content>
                  </Select.Positioner>
                </Select.Root>
              </Timeline.Title>
              <Timeline.Description>
                <Input type="date" />
              </Timeline.Description>
              <Collapsible.Root>
                <Collapsible.Trigger alignItems="center" mt="1">
                  <Collapsible.Indicator>
                    <PiCaretDown />
                  </Collapsible.Indicator>
                </Collapsible.Trigger>
                <Collapsible.Content>
                  <Textarea mt="2" />
                </Collapsible.Content>
              </Collapsible.Root>
            </Timeline.Content>
          </Timeline.Item>
        </Timeline.Root>
      </VStack>
    </VStack>
  );
}
