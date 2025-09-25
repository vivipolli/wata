import React from 'react'
import { getScoreBadge } from '../../utils/colors'

interface ScoreBadgeProps {
  score: number
  showPercentage?: boolean
  className?: string
}

const ScoreBadge: React.FC<ScoreBadgeProps> = ({
  score,
  showPercentage = true,
  className = ''
}) => {
  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getScoreBadge(score)} ${className}`}>
      {showPercentage ? `${score.toFixed(1)}%` : score.toFixed(1)}
    </span>
  )
}

export default ScoreBadge
