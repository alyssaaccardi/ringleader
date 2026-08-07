import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate, useSearchParams } from 'react-router-dom';

export default function LoginPage() {
  const { user, loading } = useAuth();
  const [params]          = useSearchParams();
  const wrongDomain       = params.get('error') === 'wrong_domain';

  if (loading) return <div className="rl-loading">Loading…</div>;
  if (user)    return <Navigate to="/" replace />;

  return (
    <div className="rl-login">
      <div className="rl-login-card">
        <h1>Ringleader</h1>
        <p className="rl-login-sub">The Answering Legal internal newsletter.</p>
        <a href="/auth/google" className="rl-login-btn">Sign in with Google</a>
        {wrongDomain && (
          <p className="rl-login-error">
            That account isn't part of the answeringlegal.com workspace.
            Sign in with your @answeringlegal.com email.
          </p>
        )}
      </div>
    </div>
  );
}
