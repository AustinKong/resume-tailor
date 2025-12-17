import { DataList, Heading, List, Text, VStack } from '@chakra-ui/react';
import { PiCheck } from 'react-icons/pi';

import DisplayDate from '@/components/custom/DisplayDate';
import type { Application } from '@/types/application';

// TODO: Consider taking in listing: Listing instead of application
export default function JobDetails({ application }: { application: Application }) {
  return (
    <>
      <VStack align="stretch">
        <Heading size="md">About the Role</Heading>
        <DataList.Root orientation="horizontal" w="full" gap="2" size="lg">
          <DataList.Item>
            <DataList.ItemLabel>Role</DataList.ItemLabel>
            <DataList.ItemValue>{application.listing.title}</DataList.ItemValue>
          </DataList.Item>
          <DataList.Item>
            <DataList.ItemLabel>Location</DataList.ItemLabel>
            <DataList.ItemValue>{application.listing.location}</DataList.ItemValue>
          </DataList.Item>
          <DataList.Item>
            <DataList.ItemLabel>Posted</DataList.ItemLabel>
            <DataList.ItemValue>
              <DisplayDate date={application.listing.postedDate} />
            </DataList.ItemValue>
          </DataList.Item>
          <DataList.Item>
            <DataList.ItemLabel>Skills</DataList.ItemLabel>
            <DataList.ItemValue>{application.listing.skills.join(', ')}</DataList.ItemValue>
          </DataList.Item>
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
