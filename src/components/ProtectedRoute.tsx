import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  allowedRoles?: string[];
}

export const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps) => {
  const { currentUser, adminUser, clientSession, role, loading, isMock } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-rakshak-midnight">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-rakshak-cyan border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-300 font-medium">Verifying authorization...</p>
        </div>
      </div>
    );
  }

  // If no one is logged in, redirect to login page
  if (!role && !isMock) {
    const targetRole = allowedRoles && allowedRoles.length === 1 ? allowedRoles[0] : '';
    const loginUrl = targetRole ? `/login?role=${targetRole}` : '/login';
    return <Navigate to={loginUrl} replace state={{ from: location }} />;
  }
  
  // If no specific roles are required, allow entry
  if (!allowedRoles || allowedRoles.length === 0) {
    return <Outlet />;
  }

  // If roles are specified, check if user has one of them
  // Prevent access to protected routes if password change is required
  if (clientSession?.requiresPasswordChange && location.pathname !== '/user/change-password') {
    return <Navigate to="/user/change-password" replace />;
  }

  const userRoleNormalized = (role || "").toLowerCase();
  const isAllowed = allowedRoles.some(r => r.toLowerCase() === userRoleNormalized);

  if (role && !isAllowed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-rakshak-midnight p-6">
        <div className="glass-panel p-8 max-w-md w-full rounded-2xl text-center">
          <div className="w-16 h-16 bg-red-500/20 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Access Denied</h2>
          <p className="text-slate-400 mb-6">You do not have permission to view this page.</p>
          <button 
            onClick={() => window.location.href = '/'}
            className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-medium transition-colors"
          >
            Return Home
          </button>
        </div>
      </div>
    );
  }

  return <Outlet />;
};
