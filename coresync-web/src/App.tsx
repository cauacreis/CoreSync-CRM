import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LoginScreen } from './pages/LoginScreen';
import { DashboardScreen } from './pages/DashboardScreen';
import { PipelineScreen } from './pages/PipelineScreen';
import { ProductsScreen } from './pages/ProductsScreen';
import { SettingsScreen } from './pages/SettingsScreen';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem('@CoreSync:token');
  return token ? children : <Navigate to="/login" replace />;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem('@CoreSync:token');
  return token ? <Navigate to="/dashboard" replace /> : children;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<PublicRoute><LoginScreen /></PublicRoute>} />
        <Route path="/dashboard" element={<PrivateRoute><DashboardScreen /></PrivateRoute>} />
        <Route path="/pipeline" element={<PrivateRoute><PipelineScreen /></PrivateRoute>} />
        <Route path="/products" element={<PrivateRoute><ProductsScreen /></PrivateRoute>} />
        <Route path="/settings" element={<PrivateRoute><SettingsScreen /></PrivateRoute>} />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
