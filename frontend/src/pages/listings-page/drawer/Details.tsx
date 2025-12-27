import { DataList, Heading, List, Tag, Text, VStack, Wrap } from '@chakra-ui/react';
import { PiCheck } from 'react-icons/pi';

import { DisplayDate } from '@/components/custom/DisplayDate';
import type { Listing } from '@/types/listing';

export function Details({ listing }: { listing: Listing }) {
  return (
    <VStack px="4" gap="4" align="stretch">
      <VStack align="stretch">
        <Heading size="md">About the Role</Heading>
        <DataList.Root orientation="horizontal" w="full" gap="2" size="lg">
          <DataList.Item>
            <DataList.ItemLabel>Role</DataList.ItemLabel>
            <DataList.ItemValue>{listing.title}</DataList.ItemValue>
          </DataList.Item>
          <DataList.Item>
            <DataList.ItemLabel>Location</DataList.ItemLabel>
            <DataList.ItemValue>{listing.location}</DataList.ItemValue>
          </DataList.Item>
          <DataList.Item>
            <DataList.ItemLabel>Posted</DataList.ItemLabel>
            <DataList.ItemValue>
              <DisplayDate date={listing.postedDate} />
            </DataList.ItemValue>
          </DataList.Item>
          <DataList.Item>
            <DataList.ItemLabel>Skills</DataList.ItemLabel>
            <DataList.ItemValue>
              <Wrap>
                {listing.skills.map((skill) => (
                  <Tag.Root key={skill} variant="subtle" size="lg">
                    <Tag.Label>{skill}</Tag.Label>
                  </Tag.Root>
                ))}
              </Wrap>
            </DataList.ItemValue>
          </DataList.Item>
        </DataList.Root>
      </VStack>

      <VStack align="stretch">
        <Heading size="md">Description</Heading>
        <Text color="fg.muted">{listing.description}</Text>
      </VStack>

      <VStack align="stretch">
        <Heading size="md">Requirements</Heading>
        <List.Root variant="plain">
          {listing.requirements.map((req, index) => (
            <List.Item key={index}>
              <List.Indicator asChild color="green">
                <PiCheck />
              </List.Indicator>
              <Text color="fg.muted">{req}</Text>
            </List.Item>
          ))}
        </List.Root>
      </VStack>
    </VStack>
  );
}
