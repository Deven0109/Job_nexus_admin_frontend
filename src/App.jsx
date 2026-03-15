import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';

// Context
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';

// Auth
import ProtectedRoute from './components/auth/ProtectedRoute';

// Layout
import AdminLayout from './components/layout/AdminLayout';

// Pages
import AdminLoginPage from './pages/AdminLoginPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import CandidateManagement from './pages/admin/CandidateManagement';
import RecruiterManagement from './pages/admin/RecruiterManagement';
import EmployerManagement from './pages/admin/EmployerManagement';
import AdminSettings from './pages/admin/AdminSettings';
import ProfileSettings from './pages/admin/ProfileSettings';
import JobManagement from './pages/admin/JobManagement';
import AdminEditJobRequest from './pages/admin/AdminEditJobRequest';
import AdminFAQManagement from './pages/admin/AdminFAQManagement';
import HiredCandidates from './pages/admin/HiredCandidates';
import NotFoundPage from './pages/shared/NotFoundPage';

import AdminApplicationManagement from './pages/admin/AdminApplicationManagement';
import NotificationsPage from './pages/admin/NotificationsPage';

// React Query Client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <NotificationProvider>
          <Router>
            <div className="admin-root text-slate-800">
            <Routes>
              {/* Admin Login */}
              <Route path="/signin" element={<AdminLoginPage />} />
              <Route path="/login" element={<Navigate to="/signin" replace />} />

              {/* Redirect root to signin */}
              <Route path="/" element={<Navigate to="/signin" replace />} />

              {/* Protected Admin Routes */}
              <Route
                element={
                  <ProtectedRoute roles={['admin']}>
                    <AdminLayout />
                  </ProtectedRoute>
                }
              >
                <Route path="/dashboard" element={<AdminDashboard />} />
                <Route path="/recruiters" element={<RecruiterManagement />} />
                <Route path="/employers" element={<EmployerManagement />} />
                <Route path="/candidates" element={<CandidateManagement />} />
                <Route path="/jobs" element={<JobManagement />} />
                <Route path="/jobs/:id" element={<AdminEditJobRequest />} />
                <Route path="/faqs" element={<AdminFAQManagement />} />
                <Route path="/applications" element={<AdminApplicationManagement />} />
                <Route path="/admin/manage-jobs/applications" element={<AdminApplicationManagement />} />
                <Route path="/notifications" element={<NotificationsPage />} />
                <Route path="/shortlisted-candidates" element={<HiredCandidates />} />
                <Route path="/settings" element={<AdminSettings />} />
                <Route path="/profile" element={<ProfileSettings />} />
              </Route>

              {/* Catch All */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
            </div>
          </Router>
        </NotificationProvider>

        {/* Toast Notifications */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              borderRadius: '10px',
              background: '#1E293B',
              color: '#F1F5F9',
              fontSize: '14px',
              fontWeight: '500',
              padding: '12px 16px',
            },
            success: {
              iconTheme: {
                primary: '#22C55E',
                secondary: '#F0FDF4',
              },
            },
            error: {
              iconTheme: {
                primary: '#EF4444',
                secondary: '#FEF2F2',
              },
            },
          }}
        />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
