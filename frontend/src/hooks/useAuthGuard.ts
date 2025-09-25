import { useAuth } from '../contexts/AuthContext'
import { useCallback } from 'react'

export const useAuthGuard = () => {
  const { isAuthenticated, isLoading, hasRole, hasAnyRole, user } = useAuth()

  const requireAuth = useCallback(() => {
    if (isLoading) {
      return { canAccess: false, reason: 'loading' }
    }
    
    if (!isAuthenticated) {
      return { canAccess: false, reason: 'unauthenticated' }
    }
    
    return { canAccess: true, reason: 'authenticated' }
  }, [isAuthenticated, isLoading])

  const requireRole = useCallback((role: string) => {
    const authCheck = requireAuth()
    if (!authCheck.canAccess) {
      return authCheck
    }
    
    if (!hasRole(role)) {
      return { canAccess: false, reason: 'insufficient_permissions' }
    }
    
    return { canAccess: true, reason: 'authorized' }
  }, [requireAuth, hasRole])

  const requireAnyRole = useCallback((roles: string[]) => {
    const authCheck = requireAuth()
    if (!authCheck.canAccess) {
      return authCheck
    }
    
    if (!hasAnyRole(roles)) {
      return { canAccess: false, reason: 'insufficient_permissions' }
    }
    
    return { canAccess: true, reason: 'authorized' }
  }, [requireAuth, hasAnyRole])

  const getAccessibleTabs = useCallback(() => {
    if (!isAuthenticated || !user) return []
    
    const allTabs = [
      { id: 'dashboard', label: 'Dashboard', roles: ['PRODUCER', 'INVESTOR', 'MANAGER'] },
      { id: 'contracts', label: 'Contracts', roles: ['PRODUCER', 'MANAGER'] },
      { id: 'monitoring', label: 'Monitoring', roles: ['PRODUCER', 'MANAGER'] },
      { id: 'audit', label: 'Audit', roles: ['PRODUCER', 'INVESTOR', 'MANAGER'] },
      { id: 'notifications', label: 'Notifications', roles: ['PRODUCER', 'INVESTOR', 'MANAGER'] },
      { id: 'produtor', label: 'Producer Dashboard', roles: ['PRODUCER'] },
      { id: 'investidor', label: 'Investor Dashboard', roles: ['INVESTOR'] }
    ]

    return allTabs.filter(tab => 
      tab.roles.some(role => hasRole(role))
    )
  }, [isAuthenticated, user, hasRole])

  return {
    isAuthenticated,
    isLoading,
    user,
    requireAuth,
    requireRole,
    requireAnyRole,
    getAccessibleTabs,
    hasRole,
    hasAnyRole
  }
}
