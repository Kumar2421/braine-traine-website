import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import LoginPage from './pages/auth/LoginPage';
import SignupPage from './pages/auth/SignupPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';
import OTPValidationPage from './pages/auth/OTPValidationPage';
import ProtectedRoute from './components/layout/ProtectedRoute';
// @ts-ignore
import DashboardV2Page from './DashboardV2Page.jsx';
// @ts-ignore
import AdminPage from './AdminPage.jsx';
import { supabase } from './supabaseClient';
// @ts-ignore
import { ToastProvider } from './utils/toast.jsx';
import {
  WorkflowPage,
  LandingPage,
  AgenticPage,
  PricingPage,
  DocsPage,
  ContactPage,
  TermsPage,
  PrivacyPage,
  Guarantees1Page,
  VectorDBPage,
  DownloadPage,
} from './pages/SubPages';

export default function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <AppShell />
      </BrowserRouter>
    </ToastProvider>
  );
}

function AppShell() {
  const location = useLocation();
  const path = location.pathname;
  // Pages that are NOT loaded via iframe (they manage their own scrolling or need root scroll)
  const isInternalPage = path.startsWith('/dashboard') || path.startsWith('/admin') || path === '/login' || path === '/signup' || path === '/forgot-password' || path === '/reset-password' || path === '/otp-validation';

  // For all other pages (iframes), we want to disable parent scrolling
  const shouldDisableScroll = !isInternalPage || path === '/';

  return (
    <div className={`app-shell ${shouldDisableScroll ? 'no-scroll' : ''}`}>
      <main className="app-main" style={{ paddingTop: 0 }}>
        <div className="app-content">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/otp-validation" element={<OTPValidationPage />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardV2Route />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard-v2"
              element={
                <ProtectedRoute>
                  <DashboardV2Route />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <AdminRoute />
                </ProtectedRoute>
              }
            />
            <Route path="/workflow" element={<WorkflowPage />} />
            <Route path="/landing" element={<LandingPage />} />
            <Route path="/agentic" element={<AgenticPage />} />
            {/* <Route path="/usecase" element={<UseCasePage />} /> */}
            <Route path="/pricing" element={<PricingPage />} />
            <Route path="/docs" element={<DocsPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/guarantees1" element={<Guarantees1Page />} />
            <Route path="/download" element={<DownloadPage />} />
            <Route path="/vector-db" element={<VectorDBPage />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}

function DashboardV2Route() {
  const navigate = (to: string) => {
    window.history.pushState({}, '', to);
    window.dispatchEvent(new PopStateEvent('popstate'));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const init = async () => {
      const { data } = await supabase.auth.getSession();
      if (!mounted) return;
      setSession(data?.session ?? null);
      setLoading(false);
    };
    init();
    const { data: sub } = supabase.auth.onAuthStateChange((_e: unknown, s: unknown) => {
      if (!mounted) return;
      setSession(s);
    });
    return () => {
      mounted = false;
      sub?.subscription?.unsubscribe();
    };
  }, []);

  if (loading) return null;
  return <DashboardV2Page session={session} navigate={navigate} />;
}

function AdminRoute() {
  const navigate = (to: string) => {
    window.history.pushState({}, '', to);
    window.dispatchEvent(new PopStateEvent('popstate'));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const init = async () => {
      const { data } = await supabase.auth.getSession();
      if (!mounted) return;
      setSession(data?.session ?? null);
      setLoading(false);
    };
    init();
    const { data: sub } = supabase.auth.onAuthStateChange((_e: unknown, s: unknown) => {
      if (!mounted) return;
      setSession(s);
    });
    return () => {
      mounted = false;
      sub?.subscription?.unsubscribe();
    };
  }, []);

  if (loading) return null;
  return <AdminPage session={session} navigate={navigate} />;
}
