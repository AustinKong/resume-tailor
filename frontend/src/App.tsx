import { Route, Routes } from 'react-router';

import DashboardLayout from '@/components/layouts/DashboardLayout';
import { Toaster } from '@/components/ui/toaster';
import ProfilePage from '@/pages/profile-page';
import ResumeGenerationPage from '@/pages/resume-generation-page';
import SavedListingsPage from '@/pages/saved-listings-page';
import ScrapingPage from '@/pages/scraping-page';

function App() {
  return (
    <>
      <Routes>
        <Route element={<DashboardLayout />}>
          <Route path="profile" element={<ProfilePage />} />
          <Route path="scraping" element={<ScrapingPage />} />
          <Route path="saved" element={<SavedListingsPage />} />
          <Route path="resume-generation" element={<ResumeGenerationPage />} />
        </Route>
      </Routes>
      <Toaster />
    </>
  );
}

export default App;
