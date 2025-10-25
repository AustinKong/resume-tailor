import { Button, Center, Heading } from '@chakra-ui/react';
import { useState } from 'react';

function App() {
  const [health, setHealth] = useState<string | null>(null);

  return (
    <>
      <Center w="full" h="100vh" flexDir="column">
        <Button
          onClick={() => {
            fetch('/api/health')
              .then((response) => response.json())
              .then((data) => setHealth(data.message));
          }}
        >
          Health Check
        </Button>
        <Heading>
          {health ? `Server Health: ${health}` : 'Click the button to check server health'}
        </Heading>
      </Center>
    </>
  );
}

export default App;
