import { Button, Center, HStack, IconButton, Textarea } from '@chakra-ui/react';
import { useState } from 'react';
import { MdDelete } from 'react-icons/md';

// TODO: Use a better input method and/or use rhf
export default function Input({
  onSubmit,
  onClearCache,
}: {
  onSubmit: (urls: string[]) => void;
  onClearCache: () => void;
}) {
  const [value, setValue] = useState('');

  const handleSubmit = () => {
    const urls = value
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0);
    onSubmit(urls);
  };

  return (
    <div style={{ position: 'relative', minHeight: '100vh' }}>
      <Center height="full" flexDirection="column" gap={4}>
        <Textarea
          placeholder="Enter job listing URLs, one per line"
          size="lg"
          width="80%"
          height="300px"
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
        <HStack>
          <Button onClick={handleSubmit}>Submit</Button>
        </HStack>
      </Center>

      {/* Floating Action Button */}
      <IconButton
        aria-label="Clear cache"
        colorScheme="red"
        size="lg"
        position="fixed"
        bottom="20px"
        right="20px"
        borderRadius="full"
        boxShadow="lg"
        onClick={onClearCache}
        title="Clear cached listings"
      >
        <MdDelete />
      </IconButton>
    </div>
  );
}
