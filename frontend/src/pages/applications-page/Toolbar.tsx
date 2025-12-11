import { Button, HStack, Input, InputGroup, Spacer } from '@chakra-ui/react';
import { PiDownload, PiMagnifyingGlass, PiPlus } from 'react-icons/pi';
import { Link } from 'react-router';

export default function Toolbar({
  searchInput,
  onSearchChange,
}: {
  searchInput: string;
  onSearchChange: (value: string) => void;
}) {
  return (
    <HStack p="1.5">
      <InputGroup startElement={<PiMagnifyingGlass />} w="md">
        <Input
          size="md"
          placeholder="Search applications"
          value={searchInput}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </InputGroup>
      <Spacer />
      <Button variant="subtle">
        <PiDownload />
        Export
      </Button>
      <Button asChild>
        <Link to="/scraping">
          <PiPlus />
          New
        </Link>
      </Button>
    </HStack>
  );
}
