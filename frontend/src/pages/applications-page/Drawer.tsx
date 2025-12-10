import {
  Box,
  CloseButton,
  DataList,
  Heading,
  HStack,
  Link,
  List,
  Separator,
  Text,
  Timeline,
  VStack,
} from '@chakra-ui/react';
import {
  PiArrowLeft,
  PiBookmarkSimple,
  PiCheck,
  PiCheckCircle,
  PiEye,
  PiGhost,
  PiHandHeart,
  PiMicrophone,
  PiPaperPlaneTilt,
  PiX,
  PiXCircle,
} from 'react-icons/pi';

import CompanyLogo from '@/components/custom/CompanyLogo';
import type { Application, StatusEnum } from '@/types/application';

interface ApplicationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  selectedApplication: Application | null;
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

export default function ApplicationDrawer({
  isOpen,
  onClose,
  selectedApplication,
}: ApplicationDrawerProps) {
  console.log(selectedApplication);
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
              <Link
                href={selectedApplication.listing.url}
                variant="underline"
                fontSize="sm"
                target="_blank"
                color="fg.info"
              >
                {selectedApplication.listing.url}
              </Link>
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
            <Heading size="md">About Your Application</Heading>
            <Timeline.Root size="lg" variant="solid">
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
          </VStack>
        </VStack>
      )}
    </Box>
  );
}
