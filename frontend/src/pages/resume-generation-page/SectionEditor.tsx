import {
  Collapsible,
  HStack,
  IconButton,
  Input,
  Menu,
  Portal,
  Text,
  Textarea,
  VStack,
} from '@chakra-ui/react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { LuChevronRight } from 'react-icons/lu';
import { PiDotsSixVertical, PiDotsThreeVertical } from 'react-icons/pi';

// import BulletInput from '@/components/custom/BulletInput';
import type {
  DetailedSectionContent,
  ParagraphSectionContent,
  Section,
  // SimpleSectionContent,
} from '@/types/resume';

import { DetailedItemEditor } from './DetailedItemEditor';

interface SectionEditorProps {
  id: string;
  section: Section;
  onSectionChange: (section: Section) => void;
  handleInsertAbove: (type: string) => void;
  handleInsertBelow: (type: string) => void;
  handleDelete: () => void;
}

export function SectionEditor({
  id,
  section,
  onSectionChange,
  handleInsertAbove,
  handleInsertBelow,
  handleDelete,
}: SectionEditorProps) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
  };

  const renderContent = () => {
    if ('text' in section.content) {
      // Paragraph section
      const content = section.content as ParagraphSectionContent;
      return (
        <Textarea
          value={content.text}
          onChange={(e) =>
            onSectionChange({
              ...section,
              content: { text: e.target.value },
            })
          }
          placeholder="Enter paragraph text..."
          rows={3}
          autoresize
          variant="flushed"
        />
      );
    } else if ('bullets' in section.content && Array.isArray(section.content.bullets)) {
      const firstBullet = section.content.bullets[0];
      if (firstBullet && typeof firstBullet === 'object' && 'title' in firstBullet) {
        // Detailed section
        const content = section.content as DetailedSectionContent;
        return (
          <DetailedItemEditor
            items={content.bullets}
            onItemsChange={(bullets) =>
              onSectionChange({
                ...section,
                content: { bullets },
              })
            }
          />
        );
      } else {
        // Simple section
        // const content = section.content as SimpleSectionContent;
        return <Text color="fg.muted">BulletInput commented out</Text>;
      }
    }
    return <Text color="fg.muted">Unknown section type</Text>;
  };

  return (
    <VStack
      ref={setNodeRef}
      style={style}
      w="full"
      align="stretch"
      borderWidth="1px"
      borderRadius="md"
      bg="bg.panel"
      position="relative"
      zIndex={transform ? 1 : 0}
    >
      <Collapsible.Root defaultOpen={false}>
        <HStack justify="space-between" w="full" p="3" bg="bg.subtle">
          <HStack gap="2" flex="1">
            <HStack
              {...attributes}
              {...listeners}
              cursor="grab"
              color="fg.muted"
              _active={{ cursor: 'grabbing' }}
            >
              <PiDotsSixVertical />
            </HStack>
            <Collapsible.Trigger asChild>
              <IconButton variant="ghost" size="xs" color="fg.muted">
                <Collapsible.Indicator
                  transition="transform 0.2s"
                  _open={{ transform: 'rotate(90deg)' }}
                >
                  <LuChevronRight />
                </Collapsible.Indicator>
              </IconButton>
            </Collapsible.Trigger>

            <Input
              value={section.title}
              onChange={(e) => onSectionChange({ ...section, title: e.target.value })}
              placeholder="Section Title"
              variant="flushed"
              fontWeight="medium"
              flex="1"
            />
          </HStack>

          <SectionMenu
            handleInsertAbove={handleInsertAbove}
            handleInsertBelow={handleInsertBelow}
            handleDelete={handleDelete}
          />
        </HStack>

        <Collapsible.Content>
          <VStack p="4" w="full" align="stretch" overflow="visible">
            {renderContent()}
          </VStack>
        </Collapsible.Content>
      </Collapsible.Root>
    </VStack>
  );
}

function SectionMenu({
  handleInsertAbove,
  handleInsertBelow,
  handleDelete,
}: {
  handleInsertAbove: (type: string) => void;
  handleInsertBelow: (type: string) => void;
  handleDelete: () => void;
}) {
  function handleSelect({ value }: { value: string }) {
    if (value === 'delete') {
      handleDelete();
    }
  }

  function handleInsertAboveSelect({ value }: { value: string }) {
    handleInsertAbove(value);
  }

  function handleInsertBelowSelect({ value }: { value: string }) {
    handleInsertBelow(value);
  }

  return (
    <Menu.Root onSelect={handleSelect}>
      <Menu.Trigger asChild>
        <IconButton variant="ghost" size="xs" color="fg.muted">
          <PiDotsThreeVertical />
        </IconButton>
      </Menu.Trigger>
      <Portal>
        <Menu.Positioner>
          <Menu.Content>
            <Menu.Root
              positioning={{ placement: 'right-start', gutter: 2 }}
              onSelect={handleInsertAboveSelect}
            >
              <Menu.TriggerItem>
                Insert Section Above <LuChevronRight />
              </Menu.TriggerItem>
              <Portal>
                <Menu.Positioner>
                  <Menu.Content>
                    <Menu.Item value="simple">Simple (Bullets)</Menu.Item>
                    <Menu.Item value="detailed">Detailed (Experience)</Menu.Item>
                    <Menu.Item value="paragraph">Paragraph</Menu.Item>
                  </Menu.Content>
                </Menu.Positioner>
              </Portal>
            </Menu.Root>
            <Menu.Root
              positioning={{ placement: 'right-start', gutter: 2 }}
              onSelect={handleInsertBelowSelect}
            >
              <Menu.TriggerItem>
                Insert Section Below <LuChevronRight />
              </Menu.TriggerItem>
              <Portal>
                <Menu.Positioner>
                  <Menu.Content>
                    <Menu.Item value="simple">Simple (Bullets)</Menu.Item>
                    <Menu.Item value="detailed">Detailed (Experience)</Menu.Item>
                    <Menu.Item value="paragraph">Paragraph</Menu.Item>
                  </Menu.Content>
                </Menu.Positioner>
              </Portal>
            </Menu.Root>
            <Menu.Item
              value="delete"
              color="fg.error"
              _hover={{ bg: 'bg.error', color: 'fg.error' }}
            >
              Delete Section
            </Menu.Item>
          </Menu.Content>
        </Menu.Positioner>
      </Portal>
    </Menu.Root>
  );
}
