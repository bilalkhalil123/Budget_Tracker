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

function App() {
  return (
    <main className="app">
      <AntdApp>
        <Router>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/dashboard" element={<Dashboard />}>
              <Route index element={<Navigate to="/dashboard/expenses" replace />} />
              <Route path="analysis" element={<Analysis />} />
              <Route path="expenses" element={<Expenses />} />
            </Route>
            {/* Standalone pages without dashboard sider */}
            <Route path="/profile" element={<Profile />} />
            <Route path="/my-account" element={<MyAccount />} />
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </Router>
      </AntdApp>
    </main>
  );
}

export default App;

