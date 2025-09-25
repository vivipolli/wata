export const getScoreColor = (score: number): string => {
  if (score >= 80) return 'text-green-600'
  if (score >= 70) return 'text-yellow-600'
  return 'text-red-600'
}

export const getScoreBadge = (score: number): string => {
  if (score >= 80) return 'bg-green-100 text-green-800'
  if (score >= 70) return 'bg-yellow-100 text-yellow-800'
  return 'bg-red-100 text-red-800'
}

export const getROIColor = (roi: number): string => {
  if (roi > 0) return 'text-green-600'
  if (roi === 0) return 'text-gray-600'
  return 'text-red-600'
}

export const getStatusColor = (status: string): string => {
  switch (status.toLowerCase()) {
    case 'completed':
    case 'active':
      return 'text-green-600'
    case 'pending':
    case 'processing':
      return 'text-yellow-600'
    case 'failed':
    case 'inactive':
      return 'text-red-600'
    default:
      return 'text-gray-600'
  }
}

export const getStatusBadge = (status: string): string => {
  switch (status.toLowerCase()) {
    case 'completed':
    case 'active':
      return 'bg-green-100 text-green-800'
    case 'pending':
    case 'processing':
      return 'bg-yellow-100 text-yellow-800'
    case 'failed':
    case 'inactive':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}
