import { DataList, Heading, List, Text, VStack } from '@chakra-ui/react';
import { PiCheck } from 'react-icons/pi';

import type { Application } from '@/types/application';

export default function JobDetails({ application }: { application: Application }) {
  const listingData = [
    { label: 'Role', value: application.listing.title },
    { label: 'Location', value: application.listing.location },
    { label: 'Posted', value: application.listing.postedDate },
    { label: 'Skills', value: application.listing.skills.join(', ') },
  ];

  return (
    <>
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
    </>
  );
}
