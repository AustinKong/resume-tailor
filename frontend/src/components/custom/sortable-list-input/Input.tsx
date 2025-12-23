import { Textarea, type TextareaProps } from '@chakra-ui/react';
import { memo } from 'react';

import { useSortableListInput, useSortableListInputItem } from './contexts';

export const Input = memo((props: Omit<TextareaProps, 'onKeyDown' | 'onPaste' | 'readOnly'>) => {
  const { register, name, update, insert, remove, fields, disabled, readOnly, defaultItem } =
    useSortableListInput();
  const { index } = useSortableListInputItem();

  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const text = e.clipboardData.getData('text');
    if (text.includes('\n')) {
      e.preventDefault();

      const lines = text
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter((l) => l.length > 0);

      if (lines.length === 0) return;

      update(index, { ...fields[index], value: lines[0] });
      lines
        .slice(1)
        .forEach((line, i) => insert(index + 1 + i, { ...(defaultItem as object), value: line }));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      insert(index + 1, defaultItem);
    }
    if (
      e.key === 'Backspace' &&
      (e.target as HTMLTextAreaElement).value === '' &&
      fields.length > 1
    ) {
      e.preventDefault();
      remove(index);
    }
  };

  return (
    <Textarea
      {...register(`${name}.${index}.value`, { disabled })}
      variant="flushed"
      rows={1}
      minH="auto"
      py="2"
      readOnly={readOnly}
      css={{ fieldSizing: 'content' }}
      resize="none"
      onKeyDown={handleKeyDown}
      onPaste={handlePaste}
      {...props}
    />
  );
});
