import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';

// Context
import { AuthProvider } from './context/AuthContext';

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
import NotFoundPage from './pages/shared/NotFoundPage';

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
        <Router>
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
              <Route path="/applications" element={<div className="p-10 text-center font-bold text-slate-400">Applications Management Module Coming Soon</div>} />
              <Route path="/shortlisted-candidates" element={<div className="p-10 text-center font-bold text-slate-400 text-2xl uppercase tracking-widest">Shortlisted Candidates Module Coming Soon</div>} />
              <Route path="/settings" element={<AdminSettings />} />
              <Route path="/profile" element={<ProfileSettings />} />
            </Route>

            {/* Catch All */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Router>

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
