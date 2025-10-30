import {
  Button,
  Checkbox,
  Field,
  Heading,
  HStack,
  Link,
  Text,
  Timeline,
  VStack,
} from '@chakra-ui/react';
import { useState } from 'react';
import { PiAcorn, PiArrowSquareOut } from 'react-icons/pi';

import BulletInput from '@/components/custom/BulletInput';
import FloatingLabelInput from '@/components/custom/FloatingLabelInput';

const DUMMY_EDUCATIONS = [
  {
    institution: 'University of Example',
    startDate: '2015-08',
    endDate: '2019-05',
    programName: 'Bachelor of Science in Computer Science',
    bulletPoints: [
      'Graduated with honors.',
      'Member of the Computer Science Club.',
      'Completed a senior thesis on machine learning algorithms.',
    ],
  },
  {
    institution: 'Example State University',
    startDate: '2019-09',
    endDate: '2021-06',
    programName: 'Master of Science in Data Science',
    bulletPoints: [
      'Thesis on big data analytics.',
      'Teaching assistant for undergraduate data science courses.',
      'Published research in data science journals.',
    ],
  },
];

export default function Education() {
  const [educations, setEducations] = useState(DUMMY_EDUCATIONS);

  return (
    <HStack w="full" px="16" h="full">
      <Timeline.Root w="3xl" size="xl" variant="subtle">
        {educations.map((education, index) => (
          <Timeline.Item key={index}>
            <Timeline.Connector>
              <Timeline.Separator />
              <Timeline.Indicator>
                <PiAcorn />
              </Timeline.Indicator>
            </Timeline.Connector>
            <Timeline.Content pb="12">
              <Entry education={education} setEducations={setEducations} />
            </Timeline.Content>
          </Timeline.Item>
        ))}
        <Button variant="outline" w="full">
          Add Education
        </Button>
      </Timeline.Root>
      <VStack
        h="full"
        justifyContent="flex-start"
        alignItems="flex-start"
        px="16"
        flex="1"
        mb="auto"
      >
        <Heading>About your information</Heading>
        <Text color="fg.subtle">
          This information will not be shared with LLMs. It will directly be written into your
          resume.
        </Text>
        <Link variant="underline" colorPalette="blue">
          Learn more about our commitment
          <PiArrowSquareOut />
        </Link>
      </VStack>
    </HStack>
  );
}

function Entry({
  education,
  setEducations,
}: {
  education: (typeof DUMMY_EDUCATIONS)[number];
  setEducations: React.Dispatch<React.SetStateAction<typeof DUMMY_EDUCATIONS>>;
}) {
  return (
    <>
      <HStack w="full">
        <Field.Root required>
          <FloatingLabelInput required label="Institution" defaultValue={education.institution} />
        </Field.Root>
        <Field.Root>
          <FloatingLabelInput label="Program name" defaultValue={education.programName} />
        </Field.Root>
      </HStack>
      <HStack w="full">
        <Field.Root flex="1">
          <FloatingLabelInput label="Start date" type="month" defaultValue={education.startDate} />
        </Field.Root>
        <Text>-</Text>
        <Field.Root flex="1">
          <FloatingLabelInput label="End date" type="month" defaultValue={education.endDate} />
        </Field.Root>
        <Checkbox.Root>
          <Checkbox.HiddenInput />
          <Checkbox.Control />
          <Checkbox.Label>Present</Checkbox.Label>
        </Checkbox.Root>
      </HStack>
      <BulletInput
        bullets={education.bulletPoints}
        onBulletsChange={(points) => {
          setEducations((prev) =>
            prev.map((edu) => (edu === education ? { ...edu, bulletPoints: points } : edu))
          );
        }}
        label="Bullet Points"
      />
    </>
  );
}
