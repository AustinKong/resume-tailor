import {
  Badge,
  Box,
  CloseButton,
  DataList,
  Drawer,
  HStack,
  Link,
  Portal,
  Table,
  Text,
  VStack,
} from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import { useRef, useState } from 'react';

import CompanyLogo from '@/components/custom/CompanyLogo';
import { getApplications } from '@/services/applications';
import type { Application } from '@/types/application';

type ApplicationStatus = 'saved' | 'applied' | 'interview-1' | 'interview-2' | 'offer' | 'rejected';

type ApplicationWithStatus = Application & { status: ApplicationStatus };

const STATUS_CONFIG: Record<ApplicationStatus, { label: string; colorPalette: string }> = {
  saved: { label: 'Saved', colorPalette: 'gray' },
  applied: { label: 'Applied', colorPalette: 'blue' },
  'interview-1': { label: 'Interview 1', colorPalette: 'purple' },
  'interview-2': { label: 'Interview 2', colorPalette: 'purple' },
  offer: { label: 'Offer', colorPalette: 'green' },
  rejected: { label: 'Rejected', colorPalette: 'red' },
};

// Helper function to map backend status to frontend status
function mapStatus(backendStatus: Application['currentStatus']): ApplicationStatus {
  switch (backendStatus) {
    case 'SAVED':
      return 'saved';
    case 'APPLIED':
      return 'applied';
    case 'INTERVIEW':
      return 'interview-1'; // Could differentiate by stage
    case 'ACCEPTED':
      return 'offer';
    case 'REJECTED':
      return 'rejected';
    case 'GHOSTED':
      return 'rejected';
    default:
      return 'saved';
  }
}

export default function SavedListingsPage() {
  const [selectedListing, setSelectedListing] = useState<ApplicationWithStatus | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Fetch applications from API
  const { data: page = { items: [], total: 0, page: 1, size: 10, pages: 0 }, isLoading } = useQuery(
    {
      queryKey: ['applications'],
      queryFn: () => getApplications(),
    }
  );

  // Convert applications to the format expected by the UI
  const listings: ApplicationWithStatus[] = page.items.map((app) => ({
    ...app,
    status: mapStatus(app.currentStatus),
  }));

  if (isLoading) {
    return <div>Loading...</div>;
  }

  const handleRowClick = (listing: ApplicationWithStatus) => {
    setSelectedListing(listing);
    setIsDrawerOpen(true);
  };

  return (
    <Box ref={containerRef} w="full" h="full" position="relative" overflow="hidden">
      {/* Table */}
      <Box w="full" h="full" overflowX="auto" overflowY="auto">
        <Table.Root variant="outline" size="sm">
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeader minW="150px">Company</Table.ColumnHeader>
              <Table.ColumnHeader minW="250px">Title</Table.ColumnHeader>
              <Table.ColumnHeader minW="150px">Location</Table.ColumnHeader>
              <Table.ColumnHeader minW="120px">Posted</Table.ColumnHeader>
              <Table.ColumnHeader minW="120px">Status</Table.ColumnHeader>
              <Table.ColumnHeader minW="100px" textAlign="center">
                Skills
              </Table.ColumnHeader>
              <Table.ColumnHeader minW="150px">Source</Table.ColumnHeader>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {listings.map((listing) => (
              <Table.Row
                key={listing.id}
                onClick={() => handleRowClick(listing)}
                cursor="pointer"
                bg={selectedListing?.id === listing.id && isDrawerOpen ? 'bg.subtle' : undefined}
                _hover={{ bg: 'bg.muted' }}
                transition="background 0.15s ease"
              >
                <Table.Cell minW="150px">
                  <CompanyLogo
                    domain={listing.listing.domain}
                    companyName={listing.listing.company}
                    mr="2"
                  />
                  {listing.listing.company}
                </Table.Cell>
                <Table.Cell minW="250px">{listing.listing.title}</Table.Cell>
                <Table.Cell minW="150px">{listing.listing.location}</Table.Cell>
                <Table.Cell minW="120px">{listing.listing.postedDate}</Table.Cell>
                <Table.Cell minW="120px">
                  <Badge size="sm" colorPalette={STATUS_CONFIG[listing.status].colorPalette}>
                    {STATUS_CONFIG[listing.status].label}
                  </Badge>
                </Table.Cell>
                <Table.Cell minW="100px" textAlign="center">
                  <Badge size="sm" variant="subtle" colorPalette="gray">
                    {listing.listing.skills.length}
                  </Badge>
                </Table.Cell>
                <Table.Cell minW="150px">
                  <Link
                    href={listing.listing.url}
                    target="_blank"
                    color="blue.500"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {new URL(listing.listing.url).hostname}
                  </Link>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
      </Box>

      {/* Drawer for listing details - modal, blocks outside interaction */}
      <Drawer.Root
        open={isDrawerOpen}
        onOpenChange={(e) => setIsDrawerOpen(e.open)}
        placement="end"
        size="md"
      >
        <Portal container={containerRef}>
          <Drawer.Backdrop pos="absolute" boxSize="full" />
          <Drawer.Positioner pos="absolute" boxSize="full">
            <Drawer.Content>
              <Drawer.Header>
                <Drawer.Title>{selectedListing?.listing.title}</Drawer.Title>
                <Text fontWeight="semibold" color="gray.600" _dark={{ color: 'gray.400' }}>
                  {selectedListing?.listing.company}
                </Text>
              </Drawer.Header>

              <Drawer.Body>
                {selectedListing && (
                  <VStack align="stretch" gap="6">
                    <DataList.Root orientation="horizontal">
                      {selectedListing.listing.location && (
                        <DataList.Item>
                          <DataList.ItemLabel>Location</DataList.ItemLabel>
                          <DataList.ItemValue>
                            {selectedListing.listing.location}
                          </DataList.ItemValue>
                        </DataList.Item>
                      )}

                      {selectedListing.listing.postedDate && (
                        <DataList.Item>
                          <DataList.ItemLabel>Posted</DataList.ItemLabel>
                          <DataList.ItemValue>
                            {selectedListing.listing.postedDate}
                          </DataList.ItemValue>
                        </DataList.Item>
                      )}

                      <DataList.Item>
                        <DataList.ItemLabel>Status</DataList.ItemLabel>
                        <DataList.ItemValue>
                          <Badge
                            size="sm"
                            colorPalette={STATUS_CONFIG[selectedListing.status].colorPalette}
                          >
                            {STATUS_CONFIG[selectedListing.status].label}
                          </Badge>
                        </DataList.ItemValue>
                      </DataList.Item>

                      <DataList.Item>
                        <DataList.ItemLabel>Skills</DataList.ItemLabel>
                        <DataList.ItemValue>
                          <HStack flexWrap="wrap" gap="2">
                            {selectedListing.listing.skills.map((skill, idx) => (
                              <Badge key={idx} size="sm" colorPalette="blue">
                                {skill}
                              </Badge>
                            ))}
                          </HStack>
                        </DataList.ItemValue>
                      </DataList.Item>

                      <DataList.Item>
                        <DataList.ItemLabel>Requirements</DataList.ItemLabel>
                        <DataList.ItemValue>
                          <VStack align="stretch" gap="1">
                            {selectedListing.listing.requirements.length > 0 ? (
                              selectedListing.listing.requirements.map((req, idx) => (
                                <Text key={idx} fontSize="sm">
                                  • {req}
                                </Text>
                              ))
                            ) : (
                              <Text fontSize="sm" color="gray.500">
                                No requirements listed
                              </Text>
                            )}
                          </VStack>
                        </DataList.ItemValue>
                      </DataList.Item>

                      <DataList.Item>
                        <DataList.ItemLabel>Description</DataList.ItemLabel>
                        <DataList.ItemValue>
                          <Text fontSize="sm" whiteSpace="pre-wrap">
                            {selectedListing.listing.description}
                          </Text>
                        </DataList.ItemValue>
                      </DataList.Item>

                      <DataList.Item>
                        <DataList.ItemLabel>Job URL</DataList.ItemLabel>
                        <DataList.ItemValue>
                          <Link
                            fontSize="sm"
                            color="blue.600"
                            _dark={{ color: 'blue.400' }}
                            href={selectedListing.listing.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            textDecoration="underline"
                          >
                            {selectedListing.listing.url}
                          </Link>
                        </DataList.ItemValue>
                      </DataList.Item>
                    </DataList.Root>
                  </VStack>
                )}
              </Drawer.Body>

              <Drawer.CloseTrigger asChild>
                <CloseButton size="sm" />
              </Drawer.CloseTrigger>
            </Drawer.Content>
          </Drawer.Positioner>
        </Portal>
      </Drawer.Root>
    </Box>
  );
}
