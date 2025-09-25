import React from 'react'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  text?: string
  className?: string
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  text,
  className = ''
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  }

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className="flex items-center space-x-3">
        <div className={`${sizeClasses[size]} border-4 border-blue-600 border-t-transparent rounded-full animate-spin`}></div>
        {text && (
          <span className="text-gray-600">{text}</span>
        )}
      </div>
    </div>
  )
}

export default LoadingSpinner
