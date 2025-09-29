import React from 'react'

interface PageHeaderProps {
  title: string
  subtitle?: string
  className?: string
}

const PageHeader: React.FC<PageHeaderProps> = ({ 
  title, 
  subtitle, 
  className = '' 
}) => {
  return (
    <div className={`mb-8 ${className}`}>
      <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
      {subtitle && (
        <p className="mt-2 text-gray-600">{subtitle}</p>
      )}
    </div>
  )
}

export default PageHeader
