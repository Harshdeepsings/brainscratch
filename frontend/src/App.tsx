
import { lazy, Suspense } from 'react';
import './index.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ErrorBoundary } from './components/ErrorBoundary';

const Landing = lazy(() => import('./pages/Landing').then(m => ({ default: m.Landing })));
const Signup = lazy(() => import('./pages/Signup').then(m => ({ default: m.Signup })));
const Signin = lazy(() => import('./pages/Signin').then(m => ({ default: m.Signin })));
const Dashboard = lazy(() => import('./pages/Dashboard').then(m => ({ default: m.Dashboard })));
const Share = lazy(() => import('./pages/Share').then(m => ({ default: m.Share })));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy').then(m => ({ default: m.PrivacyPolicy })));
const TermsOfService = lazy(() => import('./pages/TermsOfService').then(m => ({ default: m.TermsOfService })));

function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900 transition-colors">
      <div className="flex flex-col items-center gap-3">
        <div className="w-9 h-9 border-3 border-purple-200 border-t-purple-600 rounded-full animate-spin dark:border-purple-900 dark:border-t-purple-400" />
        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Loading Brainscratch...</span>
      </div>
    </div>
  );
}

function App(){
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path='/' element={<Landing />} />
            <Route path='/signup' element={<Signup />} />
            <Route path='/signin' element={<Signin />} />
            <Route path='/dashboard' element={<Dashboard />} />
            <Route path='/privacy' element={<PrivacyPolicy />} />
            <Route path='/terms' element={<TermsOfService />} />
            <Route path='/:sharelink' element={<Share />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
