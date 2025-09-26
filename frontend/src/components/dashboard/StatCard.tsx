import React from 'react'
import type { IconType } from 'react-icons'

interface StatCardProps {
  title: string
  value: string | number
  icon: IconType
  color: string
  subtitle?: string
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, color, subtitle }) => (
  <div className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow">
    <div className="p-4 sm:p-5">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <Icon className={`h-8 w-8 ${color}`} />
        </div>
        <div className="ml-4 flex-1 min-w-0">
          <dt className="text-sm font-medium text-gray-500 truncate">
            {title}
          </dt>
          <dd className="mt-1">
            <div className="text-xl sm:text-2xl font-semibold text-gray-900 truncate">
              {value}
            </div>
            {subtitle && (
              <div className="mt-1 text-xs sm:text-sm text-gray-500">
                {subtitle}
              </div>
            )}
          </dd>
        </div>
      </div>
    </div>
  </div>
)

export default StatCard
