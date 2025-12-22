import { Button, Center, Separator, Spinner, VStack } from '@chakra-ui/react';
import { PiFile } from 'react-icons/pi';
import { useNavigate } from 'react-router';
import { Link } from 'react-router';

import { useApplicationQuery } from '@/hooks/applications';
import { useResumeMutations } from '@/hooks/resumes';
import { useStickyState } from '@/hooks/utils/useStickyState';

import { Header } from './Header';
import { JobDetails } from './JobDetails';
import { TimelineEditor } from './TimelineEditor';

export function Drawer({
  onClose,
  selectedApplicationId,
}: {
  onClose: () => void;
  selectedApplicationId: string | null;
}) {
  const { application } = useApplicationQuery(selectedApplicationId);
  const { createResume, isCreateLoading } = useResumeMutations();
  const navigate = useNavigate();

  const displayApplication = useStickyState(application);

  const handleGenerateResume = async () => {
    if (!displayApplication) return;
    const resume = await createResume(displayApplication.id);
    navigate(`/resumes/${resume.id}`);
  };

  return (
    <VStack h="full" w="full" overflow="hidden" alignItems="stretch" bg="bg.panel" overflowY="auto">
      {!displayApplication ? (
        <Center h="full">
          <Spinner size="lg" />
        </Center>
      ) : (
        <VStack p="4" alignItems="stretch" gap="4" minW="md">
          <Header application={displayApplication} onClose={onClose} />
          <JobDetails application={displayApplication} />
          <Separator />
          <TimelineEditor application={displayApplication} />
          {displayApplication.resumeId ? (
            <Button asChild>
              <Link to={`resumes/${displayApplication.resumeId}`}>
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
