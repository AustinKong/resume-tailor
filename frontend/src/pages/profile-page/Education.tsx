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
import React, { useEffect, useState } from 'react';
import { PiAcorn, PiArrowSquareOut } from 'react-icons/pi';

import BulletInput from '@/components/custom/BulletInput';
import FloatingLabelInput from '@/components/custom/FloatingLabelInput';
import { useProfile } from '@/hooks/useProfile';
import { type Education } from '@/types/profile';
import { YearMonth } from '@/utils/yearMonth';

export default function Education() {
  const { profile, isGetLoading, updateProfile } = useProfile();
  const [educations, setEducations] = useState<Education[]>([]);

  useEffect(() => {
    if (profile) {
      setEducations(profile.education);
    }
  }, [profile]);

  if (isGetLoading) {
    return <Text>Loading...</Text>;
  }

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
        <Button
          variant="outline"
          w="full"
          onClick={() =>
            setEducations((prev) => [
              ...prev,
              {
                institution: '',
                program: '',
                startDate: YearMonth.today(),
                bulletPoints: [],
              } as Education,
            ])
          }
        >
          Add Education
        </Button>
        <Button
          variant="solid"
          w="full"
          mt="8"
          onClick={() => {
            updateProfile({ ...profile, education: educations });
          }}
        >
          Save Changes
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
  education: Education;
  setEducations: React.Dispatch<React.SetStateAction<Education[]>>;
}) {
  const updateEducation = (updates: Partial<Education>) => {
    setEducations((prev) => prev.map((edu) => (edu === education ? { ...edu, ...updates } : edu)));
  };

  return (
    <>
      <HStack w="full">
        <Field.Root required>
          <FloatingLabelInput
            required
            label="Institution"
            value={education.institution}
            onChange={(e) => updateEducation({ institution: e.target.value })}
          />
        </Field.Root>
        <Field.Root>
          <FloatingLabelInput
            label="Program name"
            value={education.program}
            onChange={(e) => updateEducation({ program: e.target.value })}
          />
        </Field.Root>
      </HStack>
      <HStack w="full">
        <Field.Root flex="1">
          <FloatingLabelInput
            label="Start date"
            type="month"
            value={education.startDate}
            onChange={(e) => updateEducation({ startDate: YearMonth.parse(e.target.value) })}
          />
        </Field.Root>
        <Text>-</Text>
        <Field.Root flex="1">
          <FloatingLabelInput
            label="End date"
            type="month"
            value={education.endDate || ''}
            onChange={(e) =>
              updateEducation({
                endDate: e.target.value ? YearMonth.parse(e.target.value) : undefined,
              })
            }
            disabled={!education.endDate}
          />
        </Field.Root>
        <Checkbox.Root
          checked={!education.endDate}
          onCheckedChange={(e) =>
            updateEducation({ endDate: e.checked ? undefined : YearMonth.today() })
          }
        >
          <Checkbox.HiddenInput />
          <Checkbox.Control />
          <Checkbox.Label>Present</Checkbox.Label>
        </Checkbox.Root>
      </HStack>
      <BulletInput
        bullets={education.bulletPoints}
        onBulletsChange={(points) => updateEducation({ bulletPoints: points })}
        label="Bullet Points"
      />
    </>
  );
}
