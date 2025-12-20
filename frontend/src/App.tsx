import { Route, Routes } from 'react-router';

import DashboardLayout from '@/components/layouts/dashboard';
import { Toaster } from '@/components/ui/toaster';
import ApplicationsPage from '@/pages/applications-page';
import NewListingsPage from '@/pages/new-listings-page';
import ProfilePage from '@/pages/profile-page';
import ResumeGenerationPage from '@/pages/resume-generation-page';

function App() {
  return (
    <>
      <Routes>
        <Route element={<DashboardLayout />}>
          <Route path="profile" element={<ProfilePage />} />
          <Route path="resumes/:resumeId" element={<ResumeGenerationPage />} />
          <Route path="applications" element={<ApplicationsPage />} />
          <Route path="listings/new" element={<NewListingsPage />} />
        </Route>
      </Routes>
      <Toaster />
    </>
  );
}

export default App;
