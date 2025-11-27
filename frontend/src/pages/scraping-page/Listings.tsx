import {
  Badge,
  Box,
  Checkbox,
  HoverCard,
  HStack,
  Link,
  Portal,
  Table,
  Text,
  VStack,
} from '@chakra-ui/react';

import CollapsibleTableRow from '@/components/custom/CollapsibleTableRow';
import { type Listing } from '@/types/listing';

export default function Listings({
  uniqueListings,
  duplicateListings,
  selectedListings,
  onSelectionChange,
}: {
  uniqueListings: Listing[];
  duplicateListings: {
    listing: Listing;
    duplicateOf: Listing;
  }[];
  selectedListings: Set<string>;
  onSelectionChange: (listingId: string, checked: boolean) => void;
}) {
  console.log(uniqueListings);
  console.log(duplicateListings);

  const allListings = [
    ...uniqueListings.map((listing) => ({ listing, duplicateOf: undefined })),
    ...duplicateListings.map((dup) => ({ listing: dup.listing, duplicateOf: dup.duplicateOf })),
  ];

  return (
    <Table.Root variant="outline" size="sm" width="100%">
      <Table.Header>
        <Table.Row>
          <Table.ColumnHeader w="6" /> {/* Checkbox column - no label */}
          <Table.ColumnHeader w="auto" /> {/* Chevron column - handled by CollapsibleTableRow */}
          <Table.ColumnHeader w="200px">Company</Table.ColumnHeader>
          <Table.ColumnHeader w="250px">Title</Table.ColumnHeader>
          <Table.ColumnHeader w="150px">Location</Table.ColumnHeader>
          <Table.ColumnHeader w="120px">Posted</Table.ColumnHeader>
          <Table.ColumnHeader w="150px">Status</Table.ColumnHeader>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {allListings.map((item, index) => (
          <ListingItem
            key={index}
            listing={item.listing}
            duplicateOf={item.duplicateOf}
            isSelected={selectedListings.has(item.listing.id)}
            onSelectionChange={onSelectionChange}
          />
        ))}
      </Table.Body>
    </Table.Root>
  );
}

function ListingItem({
  listing,
  duplicateOf,
  isSelected,
  onSelectionChange,
}: {
  listing: Listing;
  duplicateOf?: Listing;
  isSelected: boolean;
  onSelectionChange: (listingId: string, checked: boolean) => void;
}) {
  const isDuplicate = !!duplicateOf;
  const isSameUrl = duplicateOf && listing.url === duplicateOf.url;
  const hasCompanyDiff = duplicateOf && listing.company !== duplicateOf.company;
  const hasTitleDiff = duplicateOf && listing.title !== duplicateOf.title;
  const hasLocationDiff = duplicateOf && listing.location !== duplicateOf.location;
  const hasDateDiff = duplicateOf && listing.postedDate !== duplicateOf.postedDate;

  return (
    <CollapsibleTableRow
      expandedContent={<ListingDetails listing={listing} duplicateOf={duplicateOf} />}
    >
      {/* Checkbox column */}
      <Table.Cell w="6" p="2">
        <Checkbox.Root
          size="sm"
          mt="0.5"
          checked={isSelected}
          onCheckedChange={(details) => onSelectionChange(listing.id, details.checked === true)}
        >
          <Checkbox.HiddenInput />
          <Checkbox.Control />
        </Checkbox.Root>
      </Table.Cell>

      {/* Company column */}
      <Table.Cell w="200px" p="2">
        {hasCompanyDiff ? (
          <DiffField
            label="Company"
            oldValue={duplicateOf.company}
            newValue={listing.company}
            description="Company name has changed"
          >
            <Text fontWeight="bold" fontSize="sm" textDecoration="underline" cursor="help">
              {listing.company}
            </Text>
          </DiffField>
        ) : (
          <Text fontWeight="bold" fontSize="sm">
            {listing.company}
          </Text>
        )}
      </Table.Cell>

      {/* Title column */}
      <Table.Cell w="250px" p="2">
        {hasTitleDiff ? (
          <DiffField
            label="Title"
            oldValue={duplicateOf.title}
            newValue={listing.title}
            description="Job title has changed"
          >
            <Text fontSize="sm" textDecoration="underline" cursor="help">
              {listing.title}
            </Text>
          </DiffField>
        ) : (
          <Text fontSize="sm">{listing.title}</Text>
        )}
      </Table.Cell>

      {/* Location column */}
      <Table.Cell w="150px" p="2">
        {listing.location && (
          <>
            {hasLocationDiff ? (
              <DiffField
                label="Location"
                oldValue={duplicateOf.location || 'Not specified'}
                newValue={listing.location}
                description="Location has changed"
              >
                <Text fontSize="sm" textDecoration="underline" cursor="help">
                  {listing.location}
                </Text>
              </DiffField>
            ) : (
              <Text fontSize="sm">{listing.location}</Text>
            )}
          </>
        )}
      </Table.Cell>

      {/* Posted Date column */}
      <Table.Cell w="120px" p="2">
        {listing.postedDate && (
          <>
            {hasDateDiff ? (
              <DiffField
                label="Posted Date"
                oldValue={duplicateOf.postedDate || 'Not specified'}
                newValue={listing.postedDate}
                description="Posting date has changed"
              >
                <Text fontSize="sm" textDecoration="underline" cursor="help">
                  {listing.postedDate}
                </Text>
              </DiffField>
            ) : (
              <Text fontSize="sm">{listing.postedDate}</Text>
            )}
          </>
        )}
      </Table.Cell>

      {/* Status column */}
      <Table.Cell w="150px" p="2">
        {isDuplicate && (
          <Badge colorScheme={isSameUrl ? 'purple' : 'yellow'} size="sm">
            {isSameUrl ? 'Already Saved' : 'Similar Content'}
          </Badge>
        )}
      </Table.Cell>
    </CollapsibleTableRow>
  );
}

function ListingDetails({ listing, duplicateOf }: { listing: Listing; duplicateOf?: Listing }) {
  const isSameUrl = duplicateOf && listing.url === duplicateOf.url;

  return (
    <VStack align="stretch" gap="3">
      {/* Description - underlined if different */}
      {duplicateOf && listing.description !== duplicateOf.description ? (
        <DiffField
          label="Description"
          oldValue={duplicateOf.description}
          newValue={listing.description}
          description="Job description has changed"
        >
          <Text fontSize="sm" lineClamp={3} textDecoration="underline" cursor="help">
            {listing.description}
          </Text>
        </DiffField>
      ) : (
        <Text fontSize="sm" lineClamp={3}>
          {listing.description}
        </Text>
      )}

      {/* Keywords - underlined if different */}
      {listing.keywords.length > 0 &&
        (duplicateOf &&
        JSON.stringify(listing.keywords) !== JSON.stringify(duplicateOf.keywords) ? (
          <DiffField
            label="Keywords"
            oldValue={duplicateOf.keywords.join(', ')}
            newValue={listing.keywords.join(', ')}
            description="Keywords have changed"
          >
            <HStack flexWrap="wrap" gap="1">
              {listing.keywords.map((keyword, idx) => (
                <Badge
                  key={idx}
                  size="sm"
                  colorScheme="blue"
                  textDecoration="underline"
                  cursor="help"
                >
                  {keyword}
                </Badge>
              ))}
            </HStack>
          </DiffField>
        ) : (
          <HStack flexWrap="wrap" gap="1">
            {listing.keywords.map((keyword, idx) => (
              <Badge key={idx} size="sm" colorScheme="blue">
                {keyword}
              </Badge>
            ))}
          </HStack>
        ))}

      {/* URL - underlined if same (shows it's identical) */}
      {isSameUrl ? (
        <DiffField
          label="URL"
          oldValue={listing.url}
          newValue={listing.url}
          description="Identical URL previously applied"
        >
          <Link
            href={listing.url}
            target="_blank"
            colorPalette="blue"
            variant="underline"
            textDecoration="underline"
            cursor="help"
          >
            {listing.url}
          </Link>
        </DiffField>
      ) : (
        <Link href={listing.url} target="_blank" colorPalette="blue" variant="underline">
          {listing.url}
        </Link>
      )}
    </VStack>
  );
}

function DiffField({
  label,
  oldValue,
  newValue,
  description,
  children,
}: {
  label: string;
  oldValue: string;
  newValue: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <HoverCard.Root openDelay={200} closeDelay={100} size="sm">
      <HoverCard.Trigger asChild>{children}</HoverCard.Trigger>
      <Portal>
        <HoverCard.Positioner>
          <HoverCard.Content maxW="500px" p="4">
            <HoverCard.Arrow />
            <VStack align="stretch" gap="3">
              <Text fontSize="sm" fontWeight="bold">
                {label} Comparison
              </Text>
              <HStack gap="3" align="start">
                <VStack flex="1" align="stretch" gap="1">
                  <Text fontSize="xs" color="gray.400">
                    Original
                  </Text>
                  <Box p="2" borderRadius="md" fontSize="sm" wordBreak="break-word">
                    <Text color="red.500">{oldValue}</Text>
                  </Box>
                </VStack>
                <Box fontSize="xl" color="gray.400" alignSelf="center">
                  →
                </Box>
                <VStack flex="1" align="stretch" gap="1">
                  <Text fontSize="xs" color="gray.400">
                    Current
                  </Text>
                  <Box p="2" borderRadius="md" fontSize="sm" wordBreak="break-word">
                    <Text color="green.500">{newValue}</Text>
                  </Box>
                </VStack>
              </HStack>
              <Text fontSize="xs" color="gray.300" textAlign="center">
                {description}
              </Text>
            </VStack>
          </HoverCard.Content>
        </HoverCard.Positioner>
      </Portal>
    </HoverCard.Root>
  );
}
