import { Tabs } from '@chakra-ui/react';

import Education from './Education';
import PersonalInformation from './PersonalInformation';

const TABS = [
  { label: 'Personal Information', value: 'personal', page: <PersonalInformation /> },
  { label: 'Education', value: 'education', page: <Education /> },
  { label: 'Preferences', value: 'preferences', page: <>Dummy Preferences</> },
];

export default function ProfilePage() {
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
