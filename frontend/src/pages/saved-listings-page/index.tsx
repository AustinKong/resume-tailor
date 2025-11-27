import { Badge, Heading, HStack, Link, Spinner, Table, Text, VStack } from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';

import CollapsibleTableRow from '@/components/custom/CollapsibleTableRow';
import { getListings } from '@/services/listings';

export default function SavedListingsPage() {
  const {
    data: listings,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['listings'],
    queryFn: getListings,
  });

  return (
    <VStack w="full" h="full" px="16" py="8" align="stretch" gap="6">
      <Heading size="2xl">Saved Job Listings</Heading>

      {isLoading && (
        <HStack justify="center" py="8">
          <Spinner size="lg" />
          <Text>Loading saved listings...</Text>
        </HStack>
      )}

      {error && (
        <Text color="red.600" _dark={{ color: 'red.400' }}>
          Error loading listings: {error instanceof Error ? error.message : 'Unknown error'}
        </Text>
      )}

      {listings && !isLoading && (
        <>
          <Text color="gray.600">
            {listings.length} saved listings. Click the chevron to expand details.
          </Text>

          <Table.Root variant="outline" size="sm" width="100%">
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeader width="40px" />
                <Table.ColumnHeader width="150px">Company</Table.ColumnHeader>
                <Table.ColumnHeader width="250px">Title</Table.ColumnHeader>
                <Table.ColumnHeader width="150px">Location</Table.ColumnHeader>
                <Table.ColumnHeader width="120px">Posted</Table.ColumnHeader>
                <Table.ColumnHeader width="auto">Keywords</Table.ColumnHeader>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {listings.map((listing) => (
                <CollapsibleTableRow
                  key={listing.id}
                  expandedContent={
                    <VStack align="stretch" gap="3">
                      <div>
                        <Text fontWeight="semibold" mb="2">
                          Description
                        </Text>
                        <Text fontSize="sm" color="gray.700" _dark={{ color: 'gray.300' }}>
                          {listing.description}
                        </Text>
                      </div>
                      <div>
                        <Text fontWeight="semibold" mb="2">
                          All Keywords
                        </Text>
                        <HStack flexWrap="wrap" gap="2">
                          {listing.keywords.map((keyword, idx) => (
                            <Badge key={idx} size="sm" colorScheme="blue">
                              {keyword}
                            </Badge>
                          ))}
                        </HStack>
                      </div>
                      <div>
                        <Text fontWeight="semibold" mb="2">
                          Job URL
                        </Text>
                        <Link
                          fontSize="sm"
                          color="blue.600"
                          _dark={{ color: 'blue.400' }}
                          href={listing.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          textDecoration="underline"
                        >
                          {listing.url}
                        </Link>
                      </div>
                    </VStack>
                  }
                >
                  <Table.Cell fontWeight="semibold" width="150px">
                    {listing.company}
                  </Table.Cell>
                  <Table.Cell width="250px">{listing.title}</Table.Cell>
                  <Table.Cell width="150px">{listing.location}</Table.Cell>
                  <Table.Cell width="120px">{listing.postedDate}</Table.Cell>
                  <Table.Cell width="auto">
                    <HStack gap="1" flexWrap="wrap">
                      {listing.keywords.slice(0, 3).map((keyword, idx) => (
                        <Badge key={idx} size="sm" colorScheme="blue">
                          {keyword}
                        </Badge>
                      ))}
                      {listing.keywords.length > 3 && (
                        <Badge size="sm" colorScheme="gray">
                          +{listing.keywords.length - 3} more
                        </Badge>
                      )}
                    </HStack>
                  </Table.Cell>
                </CollapsibleTableRow>
              ))}
            </Table.Body>
          </Table.Root>
        </>
      )}
    </VStack>
  );
}
