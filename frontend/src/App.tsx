import { Route, Routes } from 'react-router';

import { DashboardLayout } from '@/components/layouts/dashboard';
import { Toaster } from '@/components/ui/toaster';
import { ApplicationsPage } from '@/pages/applications-page';
import { NewListingsPage } from '@/pages/new-listings-page';
import { SettingsPage } from '@/pages/settings-page';

export function App() {
  return (
    <>
      <Routes>
        <Route element={<DashboardLayout />}>
          <Route path="applications" element={<ApplicationsPage />} />
          <Route path="listings/new" element={<NewListingsPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Routes>
      <Toaster />
    </>
  );
}
