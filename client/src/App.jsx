import React from 'react';
import { Routes, Route, Link, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import LoginPage        from './pages/LoginPage';
import CurrentIssuePage from './pages/CurrentIssuePage';
import ArchivePage      from './pages/ArchivePage';
import IssuePage        from './pages/IssuePage';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="rl-loading">Loading…</div>;
  if (!user)   return <Navigate to="/login" replace />;
  return children;
}

function Header() {
  const { user, logout } = useAuth();
  const { pathname }     = useLocation();
  if (pathname === '/login' || !user) return null;
  return (
    <header className="rl-header">
      <div className="rl-header-inner">
        <Link to="/" className="rl-brand">Ringleader</Link>
        <nav className="rl-nav">
          <Link to="/">Current</Link>
          <Link to="/archive">Archive</Link>
        </nav>
        <div className="rl-user">
          <span className="rl-user-name">{user.name}</span>
          <button onClick={logout} className="rl-logout">Sign out</button>
        </div>
      </div>
    </header>
  );
}

export default function App() {
  return (
    <>
      <Header />
      <main className="rl-main">
        <Routes>
          <Route path="/login"         element={<LoginPage />} />
          <Route path="/"              element={<ProtectedRoute><CurrentIssuePage /></ProtectedRoute>} />
          <Route path="/archive"       element={<ProtectedRoute><ArchivePage /></ProtectedRoute>} />
          <Route path="/issues/:slug"  element={<ProtectedRoute><IssuePage /></ProtectedRoute>} />
          <Route path="*"              element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </>
  );
}
