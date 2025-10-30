import { Route, Routes } from 'react-router';

import DashboardLayout from '@/components/layouts/DashboardLayout';
import { Toaster } from '@/components/ui/toaster';
import ProfilePage from '@/pages/profile-page';

function App() {
  return (
    <>
      <Routes>
        <Route element={<DashboardLayout />}>
          <Route path="profile" element={<ProfilePage />} />
        </Route>
      </Routes>
      <Toaster />
    </>
  );
}

export default App;
