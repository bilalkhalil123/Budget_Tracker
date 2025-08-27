import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import LoginPage from './pages/Login/LoginPage';
import SignupPage from './pages/Signup/SignupPage';
import ForgotPasswordPage from './pages/ForgotPassword/ForgotPasswordPage';
import Dashboard from './pages/Dashboard/Dashboard';
import Analysis from './pages/Dashboard/Analysis';
import Expenses from './pages/Dashboard/Expenses';
import Profile from './pages/Dashboard/Profile';
import MyAccount from './pages/Dashboard/MyAccount';
import { App as AntdApp } from 'antd';
import ApiService from './services/api';

const ProtectedRoute: React.FC<{ children: JSX.Element }> = ({ children }) => {
  return ApiService.isAuthenticated() ? children : <Navigate to="/login" replace />;
};

const PublicRoute: React.FC<{ children: JSX.Element }> = ({ children }) => {
  return ApiService.isAuthenticated() ? <Navigate to="/dashboard" replace /> : children;
};

function App() {
  return (
    <main className="app">
      <AntdApp>
        <Router>
          <Routes>
            <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
            <Route path="/signup" element={<PublicRoute><SignupPage /></PublicRoute>} />
            <Route path="/forgot-password" element={<PublicRoute><ForgotPasswordPage /></PublicRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>}>
              <Route index element={<Navigate to="/dashboard/expenses" replace />} />
              <Route path="analysis" element={<Analysis />} />
              <Route path="expenses" element={<Expenses />} />
            </Route>
            {/* Standalone pages without dashboard sider */}
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/my-account" element={<ProtectedRoute><MyAccount /></ProtectedRoute>} />
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </Router>
      </AntdApp>
    </main>
  );
}

export default App;


