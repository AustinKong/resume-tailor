import { HStack, IconButton, Link as ChakraLink, Text, VStack } from '@chakra-ui/react';
import { PiBookmarkSimple, PiCheck } from 'react-icons/pi';

import { CompanyLogo } from '@/components/custom/CompanyLogo';
import type { ListingDraft, ListingDraftError, ListingDraftPending } from '@/types/listing';

export function Header({
  listingDraft,
  isReadOnly,
  isDirty,
}: {
  listingDraft: Exclude<ListingDraft, ListingDraftPending | ListingDraftError>;
  isReadOnly: boolean;
  isDirty: boolean;
}) {
  const { domain, company, url } = getListingInfo(listingDraft);

  return (
    <HStack gap="3" align="start">
      <CompanyLogo domain={domain} companyName={company || '?'} size="xl" />
      <VStack alignItems="start" gap="0" flex="1" minW="0">
        <Text fontSize="xl" fontWeight="bold" lineHeight="shorter">
          {company}
        </Text>
        <ChakraLink
          href={url}
          variant="underline"
          fontSize="sm"
          target="_blank"
          color="fg.info"
          truncate
          display="block"
          w="full"
        >
          {url}
        </ChakraLink>
      </VStack>
      <IconButton variant="ghost" type="submit" disabled={isReadOnly || !isDirty}>
        {isDirty ? <PiBookmarkSimple /> : <PiCheck />}
      </IconButton>
    </HStack>
  );
}

function getListingInfo(
  listingDraft: Exclude<ListingDraft, ListingDraftPending | ListingDraftError>
) {
  const url = listingDraft.url;

  switch (listingDraft.status) {
    case 'unique':
      return {
        domain: listingDraft.listing.domain,
        company: listingDraft.listing.company,
        url,
      };
    case 'duplicate_url':
      return {
        domain: listingDraft.duplicateOf.domain,
        company: listingDraft.duplicateOf.company,
        url,
      };
    case 'duplicate_content':
      return {
        domain: listingDraft.listing.domain || listingDraft.duplicateOf.domain,
        company: listingDraft.listing.company || listingDraft.duplicateOf.company,
        url,
      };
  }
}
