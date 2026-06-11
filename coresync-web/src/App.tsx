import React, { useEffect, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LoginScreen } from './pages/LoginScreen';
import { ToastProvider } from './contexts/ToastContext';
import { useGlobalButtonSounds } from './hooks/useAppSounds';

const DashboardScreen = React.lazy(() => import('./pages/DashboardScreen').then(module => ({ default: module.DashboardScreen })));
const PipelineScreen = React.lazy(() => import('./pages/PipelineScreen').then(module => ({ default: module.PipelineScreen })));
const ProductsScreen = React.lazy(() => import('./pages/ProductsScreen').then(module => ({ default: module.ProductsScreen })));
const SettingsScreen = React.lazy(() => import('./pages/SettingsScreen').then(module => ({ default: module.SettingsScreen })));

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem('@CoreSync:token');
  return token ? children : <Navigate to="/login" replace />;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem('@CoreSync:token');
  return token ? <Navigate to="/dashboard" replace /> : children;
}

function App() {
  useGlobalButtonSounds();

  useEffect(() => {
    // Theme Manager
    const theme = localStorage.getItem('@CoreSync:theme') || 'dark'; // default dark for existing users
    if (theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  return (
    <ToastProvider>
      <BrowserRouter>
        <Suspense fallback={<div className="h-screen w-screen bg-zinc-950 flex items-center justify-center text-lime-400 font-black text-2xl uppercase">Carregando Módulo...</div>}>
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<PublicRoute><LoginScreen /></PublicRoute>} />
            <Route path="/dashboard" element={<PrivateRoute><DashboardScreen /></PrivateRoute>} />
            <Route path="/pipeline" element={<PrivateRoute><PipelineScreen /></PrivateRoute>} />
            <Route path="/products" element={<PrivateRoute><ProductsScreen /></PrivateRoute>} />
            <Route path="/settings" element={<PrivateRoute><SettingsScreen /></PrivateRoute>} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </ToastProvider>
  );
}

export default App;
