import { Tabs } from '@chakra-ui/react';

import { Education } from './Education';
import { Experience } from './Experience';
import { PersonalInformation } from './PersonalInformation';

const TABS = [
  { label: 'Personal Information', value: 'personal', page: <PersonalInformation /> },
  { label: 'Education', value: 'education', page: <Education /> },
  { label: 'Experience', value: 'experience', page: <Experience /> },
];

// TODO: The forms are pretty shit right now. either:
// A) Continue using key resetting: https://react.dev/learn/preserving-and-resetting-state
// B) Use RHF + Controllers to manage form state instead
// Either way, the entire profile page needs to be redone
export function ProfilePage() {
  return (
    <Tabs.Root defaultValue="personal" w="full">
      <Tabs.List mb="4">
        {TABS.map(({ label, value }) => (
          <Tabs.Trigger key={value} value={value}>
            {label}
          </Tabs.Trigger>
        ))}
      </Tabs.List>
      {TABS.map(({ value, page }) => (
        <Tabs.Content key={value} value={value}>
          {page}
        </Tabs.Content>
      ))}
    </Tabs.Root>
  );
}
