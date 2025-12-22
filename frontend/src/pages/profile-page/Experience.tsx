import { Button, Checkbox, Field, Heading, HStack, Link, Text, VStack } from '@chakra-ui/react';
import { useState } from 'react';
import { PiArrowSquareOut } from 'react-icons/pi';

// import BulletInput from '@/components/custom/BulletInput';
import { FloatingLabelInput } from '@/components/ui/FloatingLabelInput';
import { useExperienceMutations, useExperiencesQuery } from '@/hooks/experiences';
import { emptyExperience, type Experience, type ExperienceType } from '@/types/experience';
import { ISOYearMonth } from '@/utils/date';

const EXPERIENCE_TYPES: ExperienceType[] = [
  'Full-time',
  'Part-time',
  'Internship',
  'Freelance',
  'Contract',
];

interface ExperienceFormProps {
  initialData: Experience[];
}

function ExperienceForm({ initialData }: ExperienceFormProps) {
  const [formData, setFormData] = useState<Experience[]>(initialData);
  const { updateExperiences } = useExperienceMutations();

  const setExperiences = (updater: Experience[] | ((prev: Experience[]) => Experience[])) => {
    setFormData(typeof updater === 'function' ? updater : updater);
  };

  // Group experiences by type
  const grouped = formData.reduce(
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
                onDelete={() => {
                  setExperiences((prev) => prev.filter((e) => e !== exp));
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
        <Button variant="solid" w="full" mt="8" onClick={() => updateExperiences(formData)}>
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

export function Experience() {
  const { experiences, isLoading } = useExperiencesQuery();

  if (isLoading || !experiences) {
    return <Text>Loading...</Text>;
  }

  return <ExperienceForm key={experiences.length} initialData={experiences} />;
}

function Entry({
  experience,
  updateExperience,
  onDelete,
}: {
  experience: Experience;
  updateExperience: (updates: Partial<Experience>) => void;
  onDelete: () => void;
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
            onChange={(e) => updateExperience({ startDate: ISOYearMonth.parse(e.target.value) })}
          />
        </Field.Root>
        <Text>-</Text>
        <Field.Root flex="1">
          <FloatingLabelInput
            label="End Date"
            type="month"
            value={experience.endDate || ''}
            onChange={(e) => updateExperience({ endDate: ISOYearMonth.parse(e.target.value) })}
            disabled={!experience.endDate}
          />
        </Field.Root>
        <Checkbox.Root
          checked={!experience.endDate}
          onCheckedChange={(e) =>
            updateExperience({ endDate: e.checked ? undefined : ISOYearMonth.today() })
          }
        >
          <Checkbox.HiddenInput />
          <Checkbox.Control />
          <Checkbox.Label>Ongoing</Checkbox.Label>
        </Checkbox.Root>
      </HStack>
      {/* <BulletInput
        bullets={experience.bullets}
        onBulletsChange={(bullets) => updateExperience({ bullets })}
        label="Bullet Points"
      /> */}
      <Button colorScheme="red" variant="outline" onClick={onDelete} alignSelf="flex-end">
        Delete Experience
      </Button>
    </VStack>
  );
}
