import { CloseButton, HStack, Text, VStack } from '@chakra-ui/react';
import { Link as ChakraLink } from '@chakra-ui/react';

import { CompanyLogo } from '@/components/custom/CompanyLogo';
import type { Application } from '@/types/application';

export function Header({
  application,
  onClose,
}: {
  application: Application;
  onClose: () => void;
}) {
  return (
    <HStack gap="3" align="start">
      <CompanyLogo
        domain={application.listing.domain}
        companyName={application.listing.company}
        size="xl"
      />
      <VStack alignItems="start" gap="0" flex="1" minW="0">
        <Text fontSize="xl" fontWeight="bold" lineHeight="shorter">
          {application.listing.company}
        </Text>
        <ChakraLink
          href={application.listing.url}
          variant="underline"
          fontSize="sm"
          target="_blank"
          color="fg.info"
          truncate
          display="block"
          w="full"
        >
          {application.listing.url}
        </ChakraLink>
      </VStack>
      <CloseButton onClick={onClose} size="sm" />
    </HStack>
  );
}
