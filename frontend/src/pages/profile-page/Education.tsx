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

// import BulletInput from '@/components/custom/BulletInput';
import { FloatingLabelInput } from '@/components/ui/FloatingLabelInput';
import { useProfileMutations, useProfileQuery } from '@/hooks/profile';
import { type Education, emptyEducation, type Profile } from '@/types/profile';
import { ISOYearMonth } from '@/utils/date';

interface EducationFormProps {
  initialData: Profile;
}

function EducationForm({ initialData }: EducationFormProps) {
  const [formData, setFormData] = useState<Profile>(initialData);
  const { updateProfile } = useProfileMutations();

  const setFormField = (updates: Partial<Profile>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  const educations = formData.education || [];

  return (
    <HStack w="full" px="16" h="full">
      <Timeline.Root w="3xl" size="xl" variant="subtle">
        {educations.map((education: Education, index: number) => (
          <Timeline.Item key={index}>
            <Timeline.Connector>
              <Timeline.Separator />
              <Timeline.Indicator>
                <PiAcorn />
              </Timeline.Indicator>
            </Timeline.Connector>
            <Timeline.Content pb="12">
              <Entry
                education={education}
                updateEducation={(updates) => {
                  setFormField({
                    education: [
                      ...educations.slice(0, index),
                      { ...education, ...updates },
                      ...educations.slice(index + 1),
                    ],
                  });
                }}
              />
            </Timeline.Content>
          </Timeline.Item>
        ))}
        <Button
          variant="outline"
          w="full"
          onClick={() =>
            setFormField({
              education: [...educations, emptyEducation],
            })
          }
        >
          Add Education
        </Button>
        <Button variant="solid" w="full" mt="8" onClick={() => updateProfile(formData)}>
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

export function Education() {
  const { profile, isLoading } = useProfileQuery();

  if (isLoading || !profile) {
    return <Text>Loading...</Text>;
  }

  return <EducationForm key={profile ? 'loaded' : 'loading'} initialData={profile} />;
}

function Entry({
  education,
  updateEducation,
}: {
  education: Education;
  updateEducation: (updates: Partial<Education>) => void;
}) {
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
            onChange={(e) => updateEducation({ startDate: ISOYearMonth.parse(e.target.value) })}
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
                endDate: ISOYearMonth.parse(e.target.value),
              })
            }
            disabled={!education.endDate}
          />
        </Field.Root>
        <Checkbox.Root
          checked={!education.endDate}
          onCheckedChange={(e) =>
            updateEducation({ endDate: e.checked ? undefined : ISOYearMonth.today() })
          }
        >
          <Checkbox.HiddenInput />
          <Checkbox.Control />
          <Checkbox.Label>Present</Checkbox.Label>
        </Checkbox.Root>
      </HStack>
      {/* <BulletInput
        bullets={education.bullets}
        onBulletsChange={(points) => updateEducation({ bullets: points })}
        label="Bullet Points"
      /> */}
    </>
  );
}
