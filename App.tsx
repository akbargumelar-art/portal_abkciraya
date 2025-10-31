
import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import DocumentationPage from './pages/DocumentationPage';
import NotFoundPage from './pages/NotFoundPage';
import { UserRole } from './types';
import InputFormPage from './pages/InputFormPage';
import VideoPage from './pages/VideoPage';
import ComplaintPage from './pages/ComplaintPage';
import PopMonitoringPage from './pages/PopMonitoringPage';
import AdminPage from './pages/AdminPage';
import SagalaPage from './pages/SagalaPage';
import OutletRegisterPage from './pages/OutletRegisterPage';
import SellThruNotaPage from './pages/SellThruNotaPage';
import UserManagementPage from './pages/UserManagementPage';
import ProfileSettingsPage from './pages/ProfileSettingsPage';
import ConnectionSettingsPage from './pages/ConnectionSettingsPage';
import FeatureUnavailablePage from './pages/FeatureUnavailablePage';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
};

const AppRoutes: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return (
      <HashRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </HashRouter>
    );
  }

  return (
    <HashRouter>
      <Layout>
        <Routes>
          {/* General Routes */}
          <Route path="/login" element={<Navigate to="/dashboard" />} />
          <Route path="/" element={<Navigate to="/dashboard" />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/sagala" element={<SagalaPage />} />
          
          {/* Implemented Features */}
          <Route path="/outlet/register" element={<OutletRegisterPage />} />
          <Route path="/sell-thru/nota" element={<SellThruNotaPage />} />
          
          {/* Dokumentasi */}
          <Route path="/documentation" element={<DocumentationPage />} />
          <Route path="/input-form" element={<InputFormPage />} />
          <Route path="/video" element={<VideoPage />} />
          <Route path="/complaint" element={<ComplaintPage />} />
          
          {/* Lainnya */}
          <Route path="/pop-monitoring" element={<PopMonitoringPage />} />
          
          {/* User Specific */}
          <Route path="/profile-settings" element={<ProfileSettingsPage />} />
          
          {/* Placeholder for future features */}
          <Route path="/feature-unavailable" element={<FeatureUnavailablePage />} />

          {/* Admin Routes */}
          {/* Client-side role check for UI purposes only. Real security must be enforced on the backend. */}
          {user.role === UserRole.AdminSuper && (
            <>
              <Route path="/admin" element={<AdminPage />} />
              <Route path="/admin/user-management" element={<UserManagementPage />} />
              <Route path="/admin/data-upload/connection" element={<ConnectionSettingsPage />} />
              {/* Other admin routes can point to the unavailable page */}
              <Route path="/admin/data-upload" element={<FeatureUnavailablePage />} />
              <Route path="/admin/data-upload/manage" element={<FeatureUnavailablePage />} />
              <Route path="/admin/db-settings" element={<FeatureUnavailablePage />} />
            </>
          )}

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Layout>
    </HashRouter>
  );
};

export default App;
