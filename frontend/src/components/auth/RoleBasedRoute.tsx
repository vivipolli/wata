import React, { ReactNode } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import ProtectedRoute from './ProtectedRoute'

interface RoleBasedRouteProps {
  children: ReactNode
  allowedRoles: string[]
  fallback?: ReactNode
}

const RoleBasedRoute: React.FC<RoleBasedRouteProps> = ({ 
  children, 
  allowedRoles, 
  fallback 
}) => {
  return (
    <ProtectedRoute requiredRoles={allowedRoles} fallback={fallback}>
      {children}
    </ProtectedRoute>
  )
}

export default RoleBasedRoute
