import { Button, Center, HStack, Image, Link as ChakraLink, Text, VStack } from '@chakra-ui/react';
import { PiPaperPlaneTilt, PiStar } from 'react-icons/pi';
import { Link } from 'react-router';

export function AboutPage() {
  return (
    <Center w="full" h="full">
      <VStack w="xl" gap="4" textWrap="pretty">
        <Image src="https://media1.tenor.com/m/_UaFpyE0SPYAAAAd/praying-cat.gif" w="xs" />
        <Text textStyle="xl" textAlign="center">
          Atto - Another Tool for Tracking & Optimizing (Applications) is an open-source project,
          built for job seekers by job seekers.
        </Text>
        <Text textStyle="md" textAlign="center">
          If you find Atto helpful, please consider starring the project GitHub, sharing it with
          your network. Your support helps me continue to improve and maintain Atto for everyone.
        </Text>
        <Text textStyle="md" textAlign="center">
          This is an early demo, and I would love to hear your feedback! Feel free to report any
          issues or suggest features on Google Forms.
          <br />- Cheers, Austin.
        </Text>
        <HStack>
          <Button asChild size="xl">
            <a href="https://github.com/AustinKong/atto" target="_blank" rel="noopener noreferrer">
              <PiStar />
              Star on GitHub
            </a>
          </Button>
          <Button asChild size="xl">
            <a
              href="https://forms.gle/your-feedback-form"
              target="_blank"
              rel="noopener noreferrer"
            >
              <PiPaperPlaneTilt />
              Give Feedback
            </a>
          </Button>
        </HStack>
        <Text textAlign="center" color="fg.muted" mt="4">
          To setup Atto, ensure you have an OpenAI API key, then add it in the
          <ChakraLink asChild variant="underline">
            <Link to="/settings">settings page</Link>
          </ChakraLink>
          . That's it!
        </Text>
      </VStack>
    </Center>
  );
}
