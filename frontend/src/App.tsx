
import './index.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Signup } from "./pages/Signup";
import { Signin } from "./pages/Signin";
import { Dashboard } from './pages/Dashboard';
import { Share } from './pages/Share';
import { Landing } from './pages/Landing';
import { PrivacyPolicy } from './pages/PrivacyPolicy';
import { TermsOfService } from './pages/TermsOfService';
import { ErrorBoundary } from './components/ErrorBoundary';

function App(){
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<Landing />} />
          <Route path='/signup' element={<Signup />} />
          <Route path='/signin' element={<Signin />} />
          <Route path='/dashboard' element={<Dashboard />} />
          <Route path='/privacy' element={<PrivacyPolicy />} />
          <Route path='/terms' element={<TermsOfService />} />
          <Route path='/:sharelink' element={<Share />} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App
