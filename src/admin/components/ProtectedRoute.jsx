import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.jsx';
import LoadingSpinner from './LoadingSpinner.jsx';

export default function ProtectedRoute({ children }) {
  const { status } = useAuth();
  const location = useLocation();

  if (status === 'loading') {
    return (
      <div className="grid min-h-screen place-items-center bg-slate-50">
        <LoadingSpinner label="Checking session…" />
      </div>
    );
  }

  if (status !== 'authenticated') {
    return <Navigate to="/admin/login" state={{ from: location.pathname }} replace />;
  }

  return children;
}
