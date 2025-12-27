import { HStack, Link, Text, VStack } from '@chakra-ui/react';

import { CompanyLogo } from '@/components/custom/CompanyLogo';
import type { Listing } from '@/types/listing';

export function Header({ listing }: { listing: Listing }) {
  return (
    <HStack gap="3" align="start" px="2" mb="4">
      <CompanyLogo domain={listing.domain} companyName={listing.company} size="xl" />
      <VStack alignItems="start" gap="0" flex="1" minW="0">
        <Text fontSize="xl" fontWeight="bold" lineHeight="shorter">
          {listing.company}
        </Text>
        <Link
          href={listing.url}
          variant="underline"
          fontSize="sm"
          target="_blank"
          color="fg.info"
          truncate
          display="block"
          w="full"
        >
          {listing.url}
        </Link>
      </VStack>
    </HStack>
  );
}
