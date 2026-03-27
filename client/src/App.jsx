import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import AuthLayout from './pages/auth/AuthLayout';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './components/DashboardLayout';
import CitizenDashboard from './pages/citizen/Dashboard';
import OperatorDashboard from './pages/operator/OperatorDashboard';
import { SocketProvider } from './context/SocketContext';


const qc = new QueryClient();

const Placeholder = ({ title }) => (
  <DashboardLayout>
    <div className="flex items-center justify-center h-96">
      <div className="text-center">
        <div className="text-orange-500 text-3xl font-black mb-2">PowerPulse</div>
        <div className="text-gray-400 text-sm">{title} — coming in Phase 2</div>
      </div>
    </div>
  </DashboardLayout>
);

export default function App() {
  return (
    <QueryClientProvider client={qc}>
      <AuthProvider>
        <SocketProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login"    element={<AuthLayout><Login /></AuthLayout>} />
            <Route path="/register" element={<AuthLayout><Register /></AuthLayout>} />
            <Route path="/dashboard" element={
              <ProtectedRoute roles={['citizen']}>
                <CitizenDashboard />
              </ProtectedRoute>} />
            <Route path="/operator" element={
              <ProtectedRoute roles={['operator', 'admin']}>
                <OperatorDashboard />
              </ProtectedRoute>} />
            <Route path="/admin" element={
              <ProtectedRoute roles={['admin']}>
                <Placeholder title="Admin panel" />
              </ProtectedRoute>} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </BrowserRouter>
        </SocketProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}