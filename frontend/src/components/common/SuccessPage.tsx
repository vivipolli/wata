import React from 'react'

interface SuccessPageProps {
  title?: string
  message?: string
  action?: {
    label: string
    onClick: () => void
  }
  icon?: React.ReactNode
}

const SuccessPage: React.FC<SuccessPageProps> = ({ 
  title = "Success!",
  message = "Your action was completed successfully.",
  action,
  icon
}) => {
  const defaultIcon = (
    <svg className="h-16 w-16 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#cdffd8] via-white to-[#94b9ff] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full text-center">
        <div className="mx-auto h-20 w-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
          {icon || defaultIcon}
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-4">{title}</h1>
        <p className="text-gray-600 mb-8">{message}</p>
        
        {action && (
          <button
            onClick={action.onClick}
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-gradient-to-r from-[#94b9ff] to-[#cdffd8] hover:from-[#7ba3ff] hover:to-[#b8ffc4] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#94b9ff] transition-all duration-200 transform hover:scale-[1.02]"
          >
            {action.label}
          </button>
        )}
        
        <div className="mt-8 text-sm text-gray-500">
          <p>Welcome to W.A.T.A. Chain!</p>
        </div>
      </div>
    </div>
  )
}

export default SuccessPage
