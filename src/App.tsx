import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import AppLayout from "@/components/AppLayout";
import LoginPage from "@/pages/LoginPage";
import HomePage from "@/pages/HomePage";
import LibraryPage from "@/pages/LibraryPage";
import MaterialPage from "@/pages/MaterialPage";
import ProfilePage from "@/pages/ProfilePage";
import GoalsPage from "@/pages/GoalsPage";
import AdminPage from "@/pages/AdminPage";
import NotFound from "@/pages/NotFound";
import InvitePage from "@/pages/InvitePage";
import AccessPage from "@/pages/AccessPage";
import ResetPasswordPage from "@/pages/ResetPasswordPage";
import SubscriptionGate from "@/components/SubscriptionGate";
import SubscriptionExpiredPage from "@/pages/SubscriptionExpiredPage";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, loading, subscriptionInactive } = useAuth();
  if (loading) return <div className="flex min-h-screen items-center justify-center text-muted-foreground">Загрузка...</div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (subscriptionInactive) return <SubscriptionExpiredPage />;
  return <>{children}</>;
};

const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  if (user?.role !== "admin" && user?.role !== "superadmin") return <Navigate to="/" replace />;
  return <>{children}</>;
};

const AppRoutes = () => (
  <Routes>
    <Route path="/login" element={<LoginPage />} />
    <Route
      element={
        <ProtectedRoute>
          <AppLayout />
        </ProtectedRoute>
      }
    >
      <Route path="/" element={<SubscriptionGate><HomePage /></SubscriptionGate>} />
      <Route path="/library" element={<SubscriptionGate><LibraryPage /></SubscriptionGate>} />
      <Route path="/material/:id" element={<SubscriptionGate><MaterialPage /></SubscriptionGate>} />
      <Route path="/goals" element={<SubscriptionGate><GoalsPage /></SubscriptionGate>} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/admin" element={<AdminRoute><AdminPage /></AdminRoute>} />
    </Route>
    <Route path="/invite/:token" element={<InvitePage />} />
    <Route path="/access/:token" element={<AccessPage />} />
    <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
    <Route path="*" element={<NotFound />} />
  </Routes>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
