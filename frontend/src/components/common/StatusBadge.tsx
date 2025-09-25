import React from 'react'
import { getStatusBadge } from '../../utils/colors'

interface StatusBadgeProps {
  status: string
  className?: string
}

const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  className = ''
}) => {
  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(status)} ${className}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  )
}

export default StatusBadge
