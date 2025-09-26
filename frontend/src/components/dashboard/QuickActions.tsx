import React from 'react'
import { FaFileContract, FaDollarSign } from 'react-icons/fa'

const QuickActions: React.FC = () => {
  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button
          onClick={() => window.location.href = '#contracts'}
          className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 text-left transition-all duration-200 group"
        >
          <div className="flex items-center mb-2">
            <FaFileContract className="h-6 w-6 text-blue-600 group-hover:text-blue-700" />
          </div>
          <h4 className="font-medium text-gray-900 group-hover:text-gray-700">Register Agreement</h4>
          <p className="text-sm text-gray-500 mt-1">Create a new PES agreement</p>
        </button>
        <button
          onClick={() => window.location.href = '#payments'}
          className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 text-left transition-all duration-200 group"
        >
          <div className="flex items-center mb-2">
            <FaDollarSign className="h-6 w-6 text-green-600 group-hover:text-green-700" />
          </div>
          <h4 className="font-medium text-gray-900 group-hover:text-gray-700">View Payments</h4>
          <p className="text-sm text-gray-500 mt-1">Check payment history and finances</p>
        </button>
      </div>
    </div>
  )
}

export default QuickActions
