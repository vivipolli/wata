import { useState, useEffect } from 'react'
import { FaPlus } from 'react-icons/fa'
import { useAuth } from '../contexts/AuthContext'
import { USER_ROLES } from '../utils/constants'
import AgreementForm from './AgreementForm'
import AgreementList from './AgreementList'

interface ContractRegistrationProps {
  producerAddress?: string
}

export default function ContractRegistration({ producerAddress: propProducerAddress }: ContractRegistrationProps): React.JSX.Element {
  const { user, hasRole } = useAuth()
  const [showForm, setShowForm] = useState<boolean>(false)
  const [success, setSuccess] = useState<boolean>(false)

  // Authorization check
  if (!user) {
    return (
      <div className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">Access Denied</h1>
            <p className="mt-2 text-gray-600">Please log in to access agreements.</p>
          </div>
        </div>
      </div>
    )
  }

  const isInvestor = hasRole(USER_ROLES.INVESTOR)
  const isProducer = hasRole(USER_ROLES.PRODUCER)

  const handleFormSuccess = () => {
    setSuccess(true)
    setShowForm(false)
    // Reset success message after 3 seconds
    setTimeout(() => setSuccess(false), 3000)
  }

  const handleShowForm = () => {
    setShowForm(true)
  }

  const handleHideForm = () => {
    setShowForm(false)
  }

  return (
    <div className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Agreement Management</h1>
          <p className="mt-2 text-gray-600">
            {isInvestor 
              ? 'View all PES (Payment for Ecosystem Services) agreements' 
              : 'Manage your PES (Payment for Ecosystem Services) agreements'
            }
          </p>
        </div>

        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800">
                  Agreement Created Successfully!
                </h3>
                <div className="mt-2 text-sm text-green-700">
                  <p>The agreement has been registered on the Hedera blockchain.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Agreement List */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            {isInvestor ? 'All Agreements' : 'Your Agreements'}
          </h2>
          <AgreementList 
            producerAddress={isProducer ? (propProducerAddress || user?.address) : undefined}
            showAllAgreements={isInvestor}
          />
        </div>

        {/* Form Section - Only for Producers */}
        {isProducer && (
          <>
            {!showForm && (
              <div className="flex justify-center">
                <button
                  onClick={handleShowForm}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#94b9ff] hover:bg-[#7ba3ff] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#94b9ff] transition-colors"
                >
                  <FaPlus className="h-4 w-4 mr-2" />
                  Add New Agreement
                </button>
              </div>
            )}

            {showForm && (
              <AgreementForm 
                onSuccess={handleFormSuccess}
                onCancel={handleHideForm}
                showCancel={true}
              />
            )}
          </>
        )}
      </div>
    </div>
  )
}

