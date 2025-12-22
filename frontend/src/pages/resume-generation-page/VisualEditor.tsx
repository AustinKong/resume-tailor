import { VStack } from '@chakra-ui/react';
import {
  closestCorners,
  DndContext,
  type DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useCallback, useRef } from 'react';

import type { ResumeData, Section } from '@/types/resume';

import { SectionEditor } from './SectionEditor';

interface VisualEditorProps {
  data: ResumeData;
  onChange: (data: ResumeData) => void;
}

export function VisualEditor({ data, onChange }: VisualEditorProps) {
  const idsRef = useRef<string[]>([]);

  // Sync ids with sections length
  if (idsRef.current.length < data.sections.length) {
    idsRef.current.push(
      ...Array.from({ length: data.sections.length - idsRef.current.length }, () =>
        crypto.randomUUID()
      )
    );
  } else if (idsRef.current.length > data.sections.length) {
    idsRef.current = idsRef.current.slice(0, data.sections.length);
  }

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: { y: 8 } },
    })
  );

  const addSectionAtIndex = useCallback(
    (index: number, type: string) => {
      let content;
      switch (type) {
        case 'detailed':
          content = {
            bullets: [
              {
                title: '',
                subtitle: '',
                startDate: '',
                endDate: '',
                bullets: [''],
              },
            ],
          };
          break;
        case 'paragraph':
          content = { text: '' };
          break;
        case 'simple':
        default:
          content = { bullets: [''] };
          break;
      }

      const newSection: Section = {
        id: crypto.randomUUID(),
        type,
        title: 'New Section',
        order: index,
        content,
      };

      const nextSections = [...data.sections];
      nextSections.splice(index, 0, newSection);

      // Update order values
      nextSections.forEach((section, i) => {
        section.order = i;
      });

      const nextIds = [...idsRef.current];
      nextIds.splice(index, 0, crypto.randomUUID());

      onChange({ sections: nextSections });
      idsRef.current = nextIds;
    },
    [data.sections, onChange]
  );

  const removeSectionAtIndex = useCallback(
    (index: number) => {
      if (data.sections.length <= 1) return;

      const nextSections = [...data.sections];
      nextSections.splice(index, 1);

      // Update order values
      nextSections.forEach((section, i) => {
        section.order = i;
      });

      const nextIds = [...idsRef.current];
      nextIds.splice(index, 1);

      onChange({ sections: nextSections });
      idsRef.current = nextIds;
    },
    [data.sections, onChange]
  );

  const updateSection = useCallback(
    (index: number, updatedSection: Section) => {
      const nextSections = [...data.sections];
      nextSections[index] = updatedSection;
      onChange({ sections: nextSections });
    },
    [data.sections, onChange]
  );

  const handleDragEnd = useCallback(
    ({ active, over }: DragEndEvent) => {
      if (!over || active.id === over.id) return;
      const oldIndex = idsRef.current.indexOf(active.id as string);
      const newIndex = idsRef.current.indexOf(over.id as string);

      const nextSections = arrayMove(data.sections, oldIndex, newIndex);
      // Update order values
      nextSections.forEach((section, i) => {
        section.order = i;
      });

      idsRef.current = arrayMove(idsRef.current, oldIndex, newIndex);
      onChange({ sections: nextSections });
    },
    [data.sections, onChange]
  );

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragEnd={handleDragEnd}
      modifiers={[restrictToVerticalAxis]}
    >
      <SortableContext items={[...idsRef.current]} strategy={verticalListSortingStrategy}>
        <VStack gap="3" w="full" align="stretch" p="4" overflowY="auto" h="full">
          {data.sections.map((section, index) => (
            <SectionEditor
              key={idsRef.current[index]}
              id={idsRef.current[index]}
              section={section}
              onSectionChange={(updatedSection) => updateSection(index, updatedSection)}
              handleInsertAbove={(type) => addSectionAtIndex(index, type)}
              handleInsertBelow={(type) => addSectionAtIndex(index + 1, type)}
              handleDelete={() => removeSectionAtIndex(index)}
            />
          ))}
        </VStack>
      </SortableContext>
    </DndContext>
  );
}
