import { Textarea } from '@chakra-ui/react';

interface EditorProps {
  value: string;
  onChange: (value: string) => void;
}

export default function Editor({ value, onChange }: EditorProps) {
  return (
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
  );
}
