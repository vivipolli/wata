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
    <div className="min-h-screen bg-gradient-to-br from-[#cdffd8] via-white to-[#94b9ff] flex items-center justify-center">
      <div className="text-center">
        <div className="mx-auto h-16 w-16 bg-gradient-to-r from-[#94b9ff] to-[#cdffd8] rounded-full flex items-center justify-center mb-6">
          <img src="/src/assets/logo.svg" alt="W.A.T.A. Logo" className="h-8 w-8" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">{message}</h2>
        <p className="text-gray-600">{subMessage}</p>
        
        {/* Animated dots */}
        <div className="flex justify-center mt-4 space-x-1">
          <div className="w-2 h-2 bg-[#94b9ff] rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-[#cdffd8] rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-2 h-2 bg-[#94b9ff] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
      </div>
    </div>
  )
}

export default LoadingPage
