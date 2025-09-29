import React from 'react'
import PageHeader from './PageHeader'

interface PageLayoutProps {
  title: string
  subtitle?: string
  children: React.ReactNode
  className?: string
  headerClassName?: string
}

const PageLayout: React.FC<PageLayoutProps> = ({ 
  title, 
  subtitle, 
  children, 
  className = '',
  headerClassName = ''
}) => {
  return (
    <div className={`max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 ${className}`}>
      <div className="px-4 py-6 sm:px-0">
        <PageHeader 
          title={title} 
          subtitle={subtitle} 
          className={headerClassName}
        />
        {children}
      </div>
    </div>
  )
}

export default PageLayout
