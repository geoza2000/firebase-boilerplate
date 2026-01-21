import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { LoginPage } from '@/pages/LoginPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { Loader2 } from 'lucide-react';
import { Toaster } from '@/components/ui/toaster';
import { FcmTokenSync, NotificationListener, NotificationPrompt } from '@/components/notifications';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <>
      {/* Sync FCM token when authenticated */}
      <FcmTokenSync />
      {children}
    </>
  );
}

function AppRoutes() {
  return (
    <>
      {/* Listen for foreground notifications */}
      <NotificationListener />
      
      {/* Prompt for notification permission (PWA only) */}
      <NotificationPrompt />
      
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
      <Toaster />
    </AuthProvider>
  );
}

export default App;
