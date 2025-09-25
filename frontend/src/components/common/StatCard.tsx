import React from 'react'

interface StatCardProps {
  title: string
  value: string | number
  subtitle?: string
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'indigo' | 'gray'
  icon?: React.ReactNode
  className?: string
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  color = 'blue',
  icon,
  className = ''
}) => {
  const colorClasses = {
    blue: 'text-blue-600',
    green: 'text-green-600',
    yellow: 'text-yellow-600',
    red: 'text-red-600',
    purple: 'text-purple-600',
    indigo: 'text-indigo-600',
    gray: 'text-gray-600'
  }

  return (
    <div className={`bg-white p-6 rounded-lg shadow ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium text-gray-500">{title}</h3>
          <p className={`text-2xl font-bold ${colorClasses[color]}`}>
            {value}
          </p>
          {subtitle && (
            <p className="text-sm text-gray-600">{subtitle}</p>
          )}
        </div>
        {icon && (
          <div className="flex-shrink-0">
            {icon}
          </div>
        )}
      </div>
    </div>
  )
}

export default StatCard
