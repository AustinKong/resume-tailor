import { Button, Checkbox, Field, Heading, HStack, Link, Text, VStack } from '@chakra-ui/react';
import { PiArrowSquareOut } from 'react-icons/pi';

import BulletInput from '@/components/custom/BulletInput';
import FloatingLabelInput from '@/components/custom/FloatingLabelInput';
import { useExperiences } from '@/hooks/useExperiences';
import { emptyExperience, type Experience, type ExperienceType } from '@/types/experience';
import { YearMonth } from '@/utils/yearMonth';

const EXPERIENCE_TYPES: ExperienceType[] = [
  'Full-time',
  'Part-time',
  'Internship',
  'Freelance',
  'Contract',
];

export default function Experience() {
  const { experiences, isGetLoading, saveExperience, setExperiences } = useExperiences();

  if (isGetLoading) {
    return <Text>Loading...</Text>;
  }

  // Group experiences by type
  const grouped = experiences.reduce(
    (acc, exp) => {
      if (!acc[exp.type]) acc[exp.type] = [];
      acc[exp.type].push(exp);
      return acc;
    },
    {} as Record<ExperienceType, Experience[]>
  );

  return (
    <HStack w="full" px="16" h="full">
      <VStack w="3xl" align="stretch" gap="8">
        {EXPERIENCE_TYPES.map((type) => (
          <VStack key={type} align="stretch" gap="4">
            <Heading size="lg">{type}</Heading>
            {(grouped[type] || []).map((exp, index) => (
              <Entry
                key={index}
                experience={exp}
                updateExperience={(updates) => {
                  setExperiences((prev) => {
                    const expIndex = prev.findIndex((e) => e === exp);
                    const newExperiences = [...prev];
                    newExperiences[expIndex] = { ...exp, ...updates };
                    return newExperiences;
                  });
                }}
              />
            ))}
            <Button
              variant="outline"
              onClick={() =>
                setExperiences((prev) => [...prev, { ...emptyExperience(type), isDirty: true }])
              }
            >
              Add {type} Experience
            </Button>
          </VStack>
        ))}
        <Button variant="solid" w="full" mt="8" onClick={() => saveExperience()}>
          Save Changes
        </Button>
      </VStack>
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
  experience,
  updateExperience,
}: {
  experience: Experience;
  updateExperience: (updates: Partial<Experience>) => void;
}) {
  return (
    <VStack align="stretch" gap="4" p="4" border="1px solid" borderColor="border" borderRadius="md">
      <HStack>
        <Field.Root required flex="1">
          <FloatingLabelInput
            required
            label="Title"
            value={experience.title}
            onChange={(e) => updateExperience({ title: e.target.value })}
          />
        </Field.Root>
        <Field.Root required flex="1">
          <FloatingLabelInput
            required
            label="Organization"
            value={experience.organization}
            onChange={(e) => updateExperience({ organization: e.target.value })}
          />
        </Field.Root>
      </HStack>
      <HStack>
        <Field.Root flex="1">
          <FloatingLabelInput
            label="Location"
            value={experience.location || ''}
            onChange={(e) => updateExperience({ location: e.target.value || undefined })}
          />
        </Field.Root>
      </HStack>
      <HStack>
        <Field.Root required flex="1">
          <FloatingLabelInput
            required
            label="Start Date"
            type="month"
            value={experience.startDate}
            onChange={(e) => updateExperience({ startDate: YearMonth.parse(e.target.value) })}
          />
        </Field.Root>
        <Text>-</Text>
        <Field.Root flex="1">
          <FloatingLabelInput
            label="End Date"
            type="month"
            value={experience.endDate || ''}
            onChange={(e) => updateExperience({ endDate: YearMonth.parse(e.target.value) })}
            disabled={!experience.endDate}
          />
        </Field.Root>
        <Checkbox.Root
          checked={!experience.endDate}
          onCheckedChange={(e) =>
            updateExperience({ endDate: e.checked ? undefined : YearMonth.today() })
          }
        >
          <Checkbox.HiddenInput />
          <Checkbox.Control />
          <Checkbox.Label>Ongoing</Checkbox.Label>
        </Checkbox.Root>
      </HStack>
      <BulletInput
        bullets={experience.bullets}
        onBulletsChange={(bullets) => updateExperience({ bullets })}
        label="Bullet Points"
      />
    </VStack>
  );
}
