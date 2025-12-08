import { useQuery } from '@tanstack/react-query';

import { getApplications } from '@/services/applications';

export default function ApplicationsPage() {
  const { data: applications } = useQuery({
    queryKey: ['applications'],
    queryFn: getApplications,
  });

  return <div>Applications Page</div>;
}
