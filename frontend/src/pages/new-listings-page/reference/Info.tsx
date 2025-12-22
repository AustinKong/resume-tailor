import { Button, Heading, Image, Link as ChakraLink, List, Text, VStack } from '@chakra-ui/react';
import { Link } from 'react-router';

import type { ListingDraft } from '@/types/listing';

import { useIngestion } from '../ingestion-modal/ingestionContext';

export function Info({ listing }: { listing: ListingDraft }) {
  const { open } = useIngestion();
  switch (listing.status) {
    case 'duplicate_url':
      return (
        <InfoSection
          imageSrc="https://http.cat/409"
          heading="URL Already in Database"
          subtext="You have already scraped or applied to this exact URL. To prevent the database from imploding, we can't allow you to add it again."
        >
          <ChakraLink asChild>
            <Link
              to={`/applications?applicationId=${listing.duplicateOfApplicationId}`}
              target="_blank"
            >
              View Existing Application
            </Link>
          </ChakraLink>
        </InfoSection>
      );
    case 'duplicate_content':
      return (
        <InfoSection
          imageSrc="https://http.cat/409"
          heading="Similar Listing Found"
          subtext="A listing with very similar content already exists in your database. This helps prevent duplicates while allowing for slight variations in job postings."
        >
          <ChakraLink asChild>
            <Link
              to={`/applications?applicationId=${listing.duplicateOfApplicationId}`}
              target="_blank"
            >
              View Existing Application
            </Link>
          </ChakraLink>
        </InfoSection>
      );
    case 'error':
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
              <Button
                variant="outline"
                size="sm"
                onClick={() => open({ id: listing.id, url: listing.url })}
              >
                Open Manual Extraction
              </Button>
            </List.Item>
          </List.Root>
        </InfoSection>
      );
    case 'unique':
    default:
      return (
        <InfoSection
          imageSrc="https://http.cat/200"
          heading="Ready to Save"
          subtext="This listing has been successfully extracted and is ready to be saved to your database."
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
