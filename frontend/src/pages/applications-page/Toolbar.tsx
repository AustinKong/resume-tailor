import { Button, HStack, Input, InputGroup, Spacer } from '@chakra-ui/react';
import { PiDownload, PiMagnifyingGlass, PiPlus } from 'react-icons/pi';
import { Link } from 'react-router';

export function Toolbar({
  searchInput,
  onSearchChange,
}: {
  searchInput: string;
  onSearchChange: (value: string) => void;
}) {
  return (
    <HStack p="1.5" borderBottom="1px solid" borderColor="border">
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
        <Link to="/listings/new">
          <PiPlus />
          New
        </Link>
      </Button>
    </HStack>
  );
}
