import { Button, Center, Separator, Spinner, VStack } from '@chakra-ui/react';
import { PiFile } from 'react-icons/pi';
import { useNavigate } from 'react-router';
import { Link } from 'react-router';

import { useApplicationQuery } from '@/hooks/applications';
import { useResumeMutations } from '@/hooks/resumes';

import Header from './Header';
import JobDetails from './JobDetails';
import TimelineEditor from './TimelineEditor';

// TODO: Make clos drwaer not immediately dissapear
// TODO: Move handleGenerateResume to a mutation
export default function Drawer({
  isOpen,
  onClose,
  selectedApplicationId,
}: {
  isOpen: boolean;
  onClose: () => void;
  selectedApplicationId: string | null;
}) {
  const { application, isLoading } = useApplicationQuery(selectedApplicationId);
  const { createResume, isCreateLoading } = useResumeMutations();
  const navigate = useNavigate();

  const handleGenerateResume = async () => {
    if (!application) return;
    const resume = await createResume(application.id);
    navigate(`/resumes/${resume.id}`);
  };

  return (
    <VStack
      h="full"
      w={isOpen ? 'lg' : '0'}
      transitionProperty="width"
      transitionDuration="moderate"
      transitionTimingFunction="ease-out"
      overflow="hidden"
      borderLeft={isOpen ? '1px solid' : 'none'}
      borderColor="border"
      bg="bg.panel"
      overflowY="auto"
    >
      {!application || isLoading ? (
        <Center w="lg" h="full">
          <Spinner size="lg" />
        </Center>
      ) : (
        <VStack w="lg" p="4" alignItems="stretch" gap="4">
          <Header application={application} onClose={onClose} />
          <JobDetails application={application} />
          <Separator />
          <TimelineEditor application={application} />
          {application.resumeId ? (
            <Button asChild>
              <Link to={`resumes/${application.resumeId}`}>
                <PiFile /> Resume
              </Link>
            </Button>
          ) : (
            <Button onClick={handleGenerateResume} loading={isCreateLoading}>
              <PiFile /> Generate Resume
            </Button>
          )}
          <Button asChild disabled>
            <Link to={`/404`}>
              <PiFile /> Cover Letter
            </Link>
          </Button>
        </VStack>
      )}
    </VStack>
  );
}
