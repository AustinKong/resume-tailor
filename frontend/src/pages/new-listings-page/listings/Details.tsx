import { Button, DataList, Editable, Heading, List, Text, VStack } from '@chakra-ui/react';
import { useState } from 'react';
import { PiCheck } from 'react-icons/pi';

import DisplayDate from '@/components/custom/DisplayDate';
import type { ScrapingListing } from '@/types/listing';

export default function Details({
  listing,
  onHighlight,
  onClearHighlight,
}: {
  listing: ScrapingListing;
  onHighlight: (text: string | null) => void;
  onClearHighlight: () => void;
}) {
  const [title, setTitle] = useState(listing.title);
  const [location, setLocation] = useState(listing.location || '');
  const [description, setDescription] = useState(listing.description);

  // Testing purposes
  const openInNewTab = (htmlString: string) => {
    // 1. Create a Blob from the HTML string
    const blob = new Blob([htmlString], { type: 'text/html' });

    // 2. Create a temporary URL pointing to that Blob
    const url = URL.createObjectURL(blob);

    // 3. Open that URL in a new tab
    window.open(url, '_blank');

    // 4. (Optional) Revoke the URL after a delay to free memory
    // Wait a few seconds to ensure the new tab has loaded it
    setTimeout(() => URL.revokeObjectURL(url), 5000);
  };

  console.log(listing.html);

  return (
    <VStack align="stretch" w="lg" p="4" gap="4" h="full" borderX="1px solid" borderColor="border">
      <VStack align="stretch">
        <Heading size="md">About the Role</Heading>
        <DataList.Root orientation="horizontal" w="full" gap="2" size="lg">
          <DataList.Item>
            <DataList.ItemLabel>Role</DataList.ItemLabel>
            <DataList.ItemValue>
              <Editable.Root value={title} onValueChange={(e) => setTitle(e.value)} size="lg">
                <Editable.Preview />
                <Editable.Input />
              </Editable.Root>
            </DataList.ItemValue>
          </DataList.Item>
          <DataList.Item>
            <DataList.ItemLabel>Location</DataList.ItemLabel>
            <DataList.ItemValue>
              <Editable.Root value={location} onValueChange={(e) => setLocation(e.value)} size="lg">
                <Editable.Preview />
                <Editable.Input />
              </Editable.Root>
            </DataList.ItemValue>
          </DataList.Item>
          <DataList.Item>
            <DataList.ItemLabel>Posted</DataList.ItemLabel>
            <DataList.ItemValue>
              {listing.postedDate ? <DisplayDate date={listing.postedDate} /> : 'N/A'}
            </DataList.ItemValue>
          </DataList.Item>
          <DataList.Item>
            <DataList.ItemLabel>Skills</DataList.ItemLabel>
            <DataList.ItemValue>{listing.skills.map((s) => s.value).join(', ')}</DataList.ItemValue>
          </DataList.Item>
        </DataList.Root>
      </VStack>

      <VStack align="stretch">
        <Heading size="md">Description</Heading>
        <Editable.Root
          value={description}
          onValueChange={(e) => setDescription(e.value)}
          size="lg"
          autoResize={true}
        >
          <Editable.Preview />
          <Editable.Textarea />
        </Editable.Root>
      </VStack>

      <VStack align="stretch">
        <Heading size="md">Requirements</Heading>
        <List.Root variant="plain">
          {listing.requirements.map((req, index) => (
            <List.Item
              key={index}
              onMouseEnter={() => onHighlight(req.quote)}
              onMouseLeave={() => onClearHighlight()}
            >
              <List.Indicator asChild color="green">
                <PiCheck />
              </List.Indicator>
              <Text color="fg.muted">{req.value}</Text>
            </List.Item>
          ))}
        </List.Root>
      </VStack>

      {listing.html && (
        <Button onClick={() => openInNewTab(listing.html)}>Preview HTML in New Tab</Button>
      )}
    </VStack>
  );
}
