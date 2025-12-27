import { Navigate, Route, Routes } from 'react-router';

import { DashboardLayout } from '@/components/layouts/dashboard';
import { Toaster } from '@/components/ui/toaster';
import { AboutPage } from '@/pages/about-page';
import { ListingsPage } from '@/pages/listings-page';
import { NewListingsPage } from '@/pages/new-listings-page';
import { SettingsPage } from '@/pages/settings-page';

export function App() {
  return (
    <>
      <Routes>
        <Route element={<DashboardLayout />}>
          <Route index element={<Navigate to="listings" replace />} />
          <Route path="about" element={<AboutPage />} />
          <Route path="listings" element={<ListingsPage />} />
          <Route path="listings/new" element={<NewListingsPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Routes>
      <Toaster />
    </>
  );
}
