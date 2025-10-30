
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
import PlaceholderPage from './pages/PlaceholderPage';
import ConnectionSettingsPage from './pages/ConnectionSettingsPage';

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
          <Route path="/login" element={<Navigate to="/dashboard" />} />
          <Route path="/" element={<Navigate to="/dashboard" />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/sagala" element={<SagalaPage />} />
          
          {/* Outlet */}
          <Route path="/outlet/register" element={<OutletRegisterPage />} />
          <Route path="/outlet/stock-perdana" element={<PlaceholderPage title="Stock Perdana Outlet" />} />
          <Route path="/outlet/stock-voucher" element={<PlaceholderPage title="Stock Voucher Outlet" />} />
          <Route path="/outlet/omzet" element={<PlaceholderPage title="Omzet Outlet" />} />
          
          {/* Sales Plan */}
          <Route path="/sales-plan/perdana" element={<PlaceholderPage title="Sales Plan Perdana" />} />
          <Route path="/sales-plan/voucher-fisik" element={<PlaceholderPage title="Sales Plan Voucher Fisik" />} />
          <Route path="/sales-plan/cvm" element={<PlaceholderPage title="Sales Plan CVM" />} />
          <Route path="/sales-plan/monitoring-visit" element={<PlaceholderPage title="Monitoring Visit" />} />
          
          {/* Sell Thru */}
          <Route path="/sell-thru/nota" element={<SellThruNotaPage />} />
          <Route path="/sell-thru/digipos" element={<PlaceholderPage title="Sell Thru DigiPos" />} />
          <Route path="/sell-thru/penjualan-d2c" element={<PlaceholderPage title="Penjualan D2C" />} />

          {/* Performansi */}
          <Route path="/performance/5s4r" element={<PlaceholderPage title="5S 4R" />} />
          <Route path="/performance/top-line" element={<PlaceholderPage title="Performansi Top Line" />} />
          <Route path="/performance/market-share" element={<PlaceholderPage title="Performansi Market Share" />} />
          <Route path="/performance/aktifasi" element={<PlaceholderPage title="Performansi Aktifasi" />} />
          <Route path="/performance/sellout" element={<PlaceholderPage title="Performansi Sellout" />} />
          <Route path="/performance/inject-voucher" element={<PlaceholderPage title="Inject Voucher Fisik" />} />
          <Route path="/performance/redeem-voucher" element={<PlaceholderPage title="Redeem Voucher Fisik" />} />

          {/* KPI */}
          <Route path="/kpi/cluster" element={<PlaceholderPage title="KPI Cluster" />} />
          <Route path="/kpi/salesforce" element={<PlaceholderPage title="KPI Salesforce" />} />
          <Route path="/kpi/d2c" element={<PlaceholderPage title="KPI D2C" />} />

          {/* Program */}
          <Route path="/program/scs" element={<PlaceholderPage title="Program SCS" />} />
          <Route path="/program/retina" element={<PlaceholderPage title="Program Retina" />} />

          {/* Fee */}
          <Route path="/fee/fee" element={<PlaceholderPage title="Fee" />} />
          <Route path="/fee/management" element={<PlaceholderPage title="Management Fee" />} />
          <Route path="/fee/marketing" element={<PlaceholderPage title="Marketing Fee" />} />

          {/* DOA */}
          <Route path="/doa/alokasi" element={<PlaceholderPage title="DOA Alokasi" />} />
          <Route path="/doa/list-sn" element={<PlaceholderPage title="DOA List SN" />} />
          <Route path="/doa/stock" element={<PlaceholderPage title="DOA Stock" />} />
          
          {/* Dokumentasi */}
          <Route path="/documentation" element={<DocumentationPage />} />
          <Route path="/input-form" element={<InputFormPage />} />
          <Route path="/video" element={<VideoPage />} />
          <Route path="/complaint" element={<ComplaintPage />} />
          
          {/* Lainnya */}
          <Route path="/pop-monitoring" element={<PopMonitoringPage />} />
          
          {/* User Specific */}
          <Route path="/profile-settings" element={<ProfileSettingsPage />} />
          
          {/* Admin Routes */}
          {user.role === UserRole.AdminSuper && (
            <>
              <Route path="/admin" element={<AdminPage />} />
              <Route path="/admin/user-management" element={<UserManagementPage />} />
              <Route path="/admin/data-upload" element={<PlaceholderPage title="Upload Database" />} />
              <Route path="/admin/data-upload/manage" element={<PlaceholderPage title="Manajemen File Data" />} />
              <Route path="/admin/data-upload/connection" element={<ConnectionSettingsPage />} />
              <Route path="/admin/db-settings" element={<PlaceholderPage title="Database Settings" />} />
            </>
          )}

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Layout>
    </HashRouter>
  );
};

export default App;
