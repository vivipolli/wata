import React from 'react'

interface ErrorPageProps {
  title?: string
  message?: string
  action?: {
    label: string
    onClick: () => void
  }
  icon?: React.ReactNode
}

const ErrorPage: React.FC<ErrorPageProps> = ({ 
  title = "Something went wrong",
  message = "We encountered an error while processing your request.",
  action,
  icon
}) => {
  const defaultIcon = (
    <svg className="h-16 w-16 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z" />
    </svg>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full text-center">
        <div className="mx-auto h-20 w-20 bg-red-100 rounded-full flex items-center justify-center mb-6">
          {icon || defaultIcon}
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-4">{title}</h1>
        <p className="text-gray-600 mb-8">{message}</p>
        
        {action && (
          <button
            onClick={action.onClick}
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-200 transform hover:scale-[1.02]"
          >
            {action.label}
          </button>
        )}
        
        <div className="mt-8 text-sm text-gray-500">
          <p>If this problem persists, please contact support.</p>
        </div>
      </div>
    </div>
  )
}

export default ErrorPage
