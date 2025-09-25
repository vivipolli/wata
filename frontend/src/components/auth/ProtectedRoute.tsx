import React, { ReactNode } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import AuthPage from './AuthPage'
import LoadingPage from '../common/LoadingPage'
import ErrorPage from '../common/ErrorPage'

interface ProtectedRouteProps {
  children: ReactNode
  requiredRoles?: string[]
  fallback?: ReactNode
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRoles = [], 
  fallback 
}) => {
  const { isAuthenticated, isLoading, hasAnyRole } = useAuth()

  // Show loading page while checking authentication
  if (isLoading) {
    return (
      <LoadingPage 
        message="Verifying Access"
        subMessage="Checking your authentication status..."
      />
    )
  }

  // Show auth page (login/register) if not authenticated
  if (!isAuthenticated) {
    return <AuthPage />
  }

  // Check role-based access if required roles are specified
  if (requiredRoles.length > 0 && !hasAnyRole(requiredRoles)) {
    if (fallback) {
      return <>{fallback}</>
    }
    
    return (
      <ErrorPage
        title="Access Denied"
        message={`You don't have permission to access this page. Required roles: ${requiredRoles.join(', ')}`}
        action={{
          label: "Go Back",
          onClick: () => window.history.back()
        }}
      />
    )
  }

  // Render protected content
  return <>{children}</>
}

export default ProtectedRoute
