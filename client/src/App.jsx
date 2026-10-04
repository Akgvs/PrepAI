import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { SignIn, SignUp } from './context/AuthContext.jsx';
import DashboardLayout from './layouts/DashboardLayout.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';

// Lazy-loaded page components for AI Mock Interviews
const LandingPage = lazy(() => import('./pages/LandingPage.jsx'));
const PricingPage = lazy(() => import('./pages/PricingPage.jsx'));
const DashboardPage = lazy(() => import('./pages/DashboardPage.jsx'));
const MockInterviewsPage = lazy(() => import('./pages/MockInterviewsPage.jsx'));
const InterviewSessionPage = lazy(() => import('./pages/InterviewSessionPage.jsx'));
const ResumeListPage = lazy(() => import('./pages/ResumeListPage.jsx'));
const ResumeBuilderPage = lazy(() => import('./pages/ResumeBuilderPage.jsx'));

const PageFallback = () => (
  <div className="min-h-[60vh] flex items-center justify-center text-slate-400">
    <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
  </div>
);

function App() {
  return (
    <Suspense fallback={<PageFallback />}>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route
          path="/sign-in/*"
          element={
            <div className="min-h-screen flex items-center justify-center bg-[#0b0f19]">
              <SignIn routing="path" path="/sign-in" signUpUrl="/sign-up" />
            </div>
          }
        />
        <Route
          path="/sign-up/*"
          element={
            <div className="min-h-screen flex items-center justify-center bg-[#0b0f19]">
              <SignUp routing="path" path="/sign-up" signInUrl="/sign-in" />
            </div>
          }
        />

        {/* Protected dashboard routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardPage />} />
          <Route path="mocks" element={<MockInterviewsPage />} />
          <Route path="mocks/:id" element={<InterviewSessionPage />} />
          <Route path="resumes" element={<ResumeListPage />} />
          <Route path="resumes/:id" element={<ResumeBuilderPage />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}

export default App;
