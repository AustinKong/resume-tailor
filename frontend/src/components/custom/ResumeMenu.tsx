import { IconButton, Menu, Portal } from '@chakra-ui/react';
import { LuFiles } from 'react-icons/lu';
import { useNavigate } from 'react-router';

interface ResumeMenuProps {
  resumeIds: string[];
  onCreateNew: () => void;
}

export default function ResumeMenu({ resumeIds, onCreateNew }: ResumeMenuProps) {
  const navigate = useNavigate();

  const handleResumeSelect = (resumeId: string) => {
    navigate(`/resume-generation?resumeId=${resumeId}`);
  };

  return (
    <Menu.Root>
      <Menu.Trigger asChild>
        <IconButton variant="outline" size="sm" title="View resumes for this listing">
          <LuFiles />
        </IconButton>
      </Menu.Trigger>
      <Portal>
        <Menu.Positioner>
          <Menu.Content minW="200px">
            {resumeIds.length > 0 ? (
              <>
                {resumeIds.map((resumeId) => (
                  <Menu.Item
                    key={resumeId}
                    value={resumeId}
                    onClick={() => handleResumeSelect(resumeId)}
                  >
                    Resume {resumeIds.indexOf(resumeId) + 1}
                  </Menu.Item>
                ))}
                <Menu.Separator />
              </>
            ) : (
              <Menu.Item value="empty" disabled>
                No resumes yet
              </Menu.Item>
            )}
            <Menu.Item
              value="new"
              onClick={onCreateNew}
              fontWeight="semibold"
              color="blue.600"
              _dark={{ color: 'blue.400' }}
            >
              + New Resume
            </Menu.Item>
          </Menu.Content>
        </Menu.Positioner>
      </Portal>
    </Menu.Root>
  );
}
