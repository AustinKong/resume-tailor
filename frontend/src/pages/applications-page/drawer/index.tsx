import { Button, Center, Separator, Spinner, VStack } from '@chakra-ui/react';
import { PiFile } from 'react-icons/pi';
import { useNavigate } from 'react-router';
import { Link } from 'react-router';

import { useApplicationQuery } from '@/hooks/applications';
import { useResumeMutations } from '@/hooks/resumes';

import { Header } from './Header';
import { JobDetails } from './JobDetails';
import { TimelineEditor } from './TimelineEditor';

export function Drawer({
  onClose,
  selectedApplicationId,
}: {
  onClose: () => void;
  selectedApplicationId: string;
}) {
  const { application } = useApplicationQuery(selectedApplicationId);
  const { createResume, isCreateLoading } = useResumeMutations();
  const navigate = useNavigate();

  const handleGenerateResume = async () => {
    if (!application) return;
    const resume = await createResume(application.id);
    navigate(`/resumes/${resume.id}`);
  };

  if (!application) {
    return (
      <Center h="full">
        <Spinner size="lg" />
      </Center>
    );
  }

  return (
    <VStack h="full" p="4" alignItems="stretch" gap="4" bg="bg.panel" overflowY="auto">
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
  );
}
