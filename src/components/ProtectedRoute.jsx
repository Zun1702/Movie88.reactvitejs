import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, user, loading } = useSelector((state) => state.auth);

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '1.5rem',
        color: '#666'
      }}>
        Loading...
      </div>
    );
  }

  // Not authenticated - redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  // Check role authorization
  if (allowedRoles.length > 0 && user) {
    const userRole = user.roleName;
    if (!allowedRoles.includes(userRole)) {
      // User doesn't have permission - redirect to unauthorized page or login
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          fontSize: '1.5rem',
          color: '#dc2626'
        }}>
          <h1>Access Denied</h1>
          <p style={{ fontSize: '1rem', color: '#666', marginTop: '1rem' }}>
            You don't have permission to access this page.
          </p>
          <button
            onClick={() => window.location.href = '/admin/login'}
            style={{
              marginTop: '2rem',
              padding: '0.75rem 2rem',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              fontSize: '1rem'
            }}
          >
            Back to Login
          </button>
        </div>
      );
    }
  }

  // Authenticated and authorized - render children
  return children;
};

export default ProtectedRoute;
