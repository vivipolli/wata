import React from 'react'

interface PrimaryButtonProps {
  children: React.ReactNode
  onClick?: () => void
  type?: 'button' | 'submit' | 'reset'
  disabled?: boolean
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  children,
  onClick,
  type = 'button',
  disabled = false,
  className = '',
  size = 'md'
}) => {
  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-3 text-base',
    lg: 'px-6 py-4 text-lg'
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        inline-flex items-center justify-center
        font-semibold text-white
        rounded-lg shadow-sm
        transition-all duration-200 transform hover:scale-[1.02]
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#60a5fa]
        disabled:opacity-50 disabled:cursor-not-allowed
        ${sizeClasses[size]}
        ${className}
      `}
      style={{
        backgroundColor: '#60a5fa',
        backgroundImage: 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)',
        boxShadow: '0 4px 14px 0 rgba(96, 165, 250, 0.4)'
      }}
      onMouseEnter={(e) => {
        if (!disabled) {
          e.currentTarget.style.backgroundColor = '#3b82f6'
          e.currentTarget.style.boxShadow = '0 6px 20px 0 rgba(96, 165, 250, 0.5)'
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled) {
          e.currentTarget.style.backgroundColor = '#60a5fa'
          e.currentTarget.style.boxShadow = '0 4px 14px 0 rgba(96, 165, 250, 0.4)'
        }
      }}
    >
      {children}
    </button>
  )
}

export default PrimaryButton
