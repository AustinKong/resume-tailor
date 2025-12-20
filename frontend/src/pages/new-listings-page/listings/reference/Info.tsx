import { Heading, Image, Link as ChakraLink, List, Text, VStack } from '@chakra-ui/react';
import { Link } from 'react-router';

import type { ScrapingListing } from '@/types/listing';

export default function Info({
  listing,
  setActiveTab,
}: {
  listing: ScrapingListing;
  setActiveTab: React.Dispatch<React.SetStateAction<string>>;
}) {
  switch (listing.status) {
    case 'duplicate_url':
      return (
        <InfoSection
          imageSrc="https://http.cat/409"
          heading="Already in Database"
          subtext="You have already scraped or applied to this exact URL. To prevent the database from imploding, we can't allow you to add it again."
        >
          <ChakraLink asChild>
            <Link
              to={`/applications?applicationId=${listing.duplicateOf?.applicationId}`}
              target="_blank"
            >
              View Existing Application
            </Link>
          </ChakraLink>
        </InfoSection>
      );
    case 'duplicate_semantic': {
      const { company: duplicateCompany, title: duplicateTitle } = listing.duplicateOf!.listing;
      return (
        <InfoSection
          imageSrc="https://http.cat/409"
          heading="Potential Duplicate Found"
          subtext={`Our AI detected that this job description is identical to an existing entry: "${duplicateTitle}" at ${duplicateCompany}.`}
        >
          <Text>Compare the details in the center column with your existing record.</Text>
        </InfoSection>
      );
    }
    case 'failed':
      return (
        <InfoSection
          imageSrc="https://http.cat/422"
          heading="Extraction Failed"
          subtext="The AI was unable to extract information from this listing. What to do next:"
        >
          <Text>Error: {listing.error}</Text>
          <List.Root as="ol">
            <List.Item>Open the original URL in your browser.</List.Item>
            <List.Item>Copy the entire job description text.</List.Item>
            <List.Item>
              Paste the text into the{' '}
              <ChakraLink variant="underline" onClick={() => setActiveTab('extract')}>
                manual extraction terminal
              </ChakraLink>
            </List.Item>
          </List.Root>
        </InfoSection>
      );
    default:
      return (
        <InfoSection
          imageSrc="https://http.cat/500"
          heading="Something went Wrong"
          subtext="This listing has an unknown status, you really should not be seeing this."
        />
      );
  }
}

function InfoSection({
  imageSrc,
  heading,
  subtext,
  children,
}: {
  imageSrc: string;
  heading: string;
  subtext: string;
  children?: React.ReactNode;
}) {
  return (
    <VStack w="full" h="full" p="4">
      <Image src={imageSrc} w="1/2" />
      <Heading size="2xl">{heading}</Heading>
      <Text maxW="lg">{subtext}</Text>
      {children}
    </VStack>
  );
}
