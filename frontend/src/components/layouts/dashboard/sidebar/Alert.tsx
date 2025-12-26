import { Card, Link as ChakraLink } from '@chakra-ui/react';
import { Link } from 'react-router';

export function Alert() {
  return (
    <Card.Root m="4" size="sm" variant="subtle" minW="32">
      <Card.Body>
        <Card.Title>Welcome!</Card.Title>
        <Card.Description>
          Atto is open-source. Learn more about the project and setup{' '}
          <ChakraLink variant="underline" asChild>
            <Link to="/about">here</Link>
          </ChakraLink>
          .
        </Card.Description>
      </Card.Body>
    </Card.Root>
  );
}
