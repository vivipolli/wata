import React from 'react'
import LoadingSpinner from './LoadingSpinner'

interface LoadingPageProps {
  message?: string
  subMessage?: string
}

const LoadingPage: React.FC<LoadingPageProps> = ({ 
  message = "Loading...", 
  subMessage = "Please wait while we prepare your dashboard" 
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
      <div className="text-center">
        <div className="mx-auto h-16 w-16 bg-gradient-to-r from-blue-600 to-green-600 rounded-full flex items-center justify-center mb-6">
          <LoadingSpinner size="lg" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">{message}</h2>
        <p className="text-gray-600">{subMessage}</p>
        
        {/* Animated dots */}
        <div className="flex justify-center mt-4 space-x-1">
          <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-green-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
      </div>
    </div>
  )
}

export default LoadingPage
