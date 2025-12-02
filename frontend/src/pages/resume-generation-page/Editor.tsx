import { Tabs, Textarea } from '@chakra-ui/react';
import { LuCode, LuPencil } from 'react-icons/lu';

import type { ResumeData } from '@/types/resume';

import VisualEditor from './VisualEditor';

interface EditorProps {
  value: string;
  onChange: (value: string) => void;
}

export default function Editor({ value, onChange }: EditorProps) {
  const handleVisualEditorChange = (data: ResumeData) => {
    const jsonString = JSON.stringify(data, null, 2);
    onChange(jsonString);
  };

  // Parse the JSON value for the visual editor
  let parsedData: ResumeData | null = null;
  try {
    parsedData = JSON.parse(value);
  } catch {
    // Invalid JSON, visual editor will be disabled
  }

  return (
    <Tabs.Root defaultValue="visual" h="full">
      <Tabs.List>
        <Tabs.Trigger value="visual">
          <LuPencil />
          Visual Editor
        </Tabs.Trigger>
        <Tabs.Trigger value="json">
          <LuCode />
          JSON Editor
        </Tabs.Trigger>
      </Tabs.List>

      <Tabs.Content value="visual" h="calc(100% - 42px)">
        {parsedData ? (
          <VisualEditor data={parsedData} onChange={handleVisualEditorChange} />
        ) : (
          <Textarea
            value="Invalid JSON - switch to JSON Editor to fix"
            readOnly
            h="full"
            w="full"
            p={4}
            resize="none"
            border="none"
            color="fg.error"
          />
        )}
      </Tabs.Content>

      <Tabs.Content value="json" h="calc(100% - 42px)">
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          fontFamily="'Fira Code', monospace"
          fontSize="sm"
          h="full"
          w="full"
          p={4}
          resize="none"
          border="none"
          _focus={{ ring: 0 }}
          spellCheck={false}
        />
      </Tabs.Content>
    </Tabs.Root>
  );
}
