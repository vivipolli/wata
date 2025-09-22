import { useState } from 'react'
import { FaPlus, FaMapMarkerAlt } from 'react-icons/fa'
import { useAgreements } from '../hooks'
import type { ContractRegistrationProps, ContractFormData } from '../types'

export default function ContractRegistration({}: ContractRegistrationProps): JSX.Element {
  const { createAgreement, loading } = useAgreements()
  const [formData, setFormData] = useState<ContractFormData>({
    producerName: '',
    producerAddress: '',
    baseValue: '',
    hectares: '',
    locationLat: '',
    locationLng: '',
    durationDays: ''
  })
  const [success, setSuccess] = useState<boolean>(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault()
    setSuccess(false)

    try {
      const agreementData = {
        producerName: formData.producerName,
        producerAddress: formData.producerAddress,
        baseValue: parseInt(formData.baseValue),
        hectares: parseInt(formData.hectares),
        durationDays: parseInt(formData.durationDays),
        locationLat: parseFloat(formData.locationLat) || undefined,
        locationLng: parseFloat(formData.locationLng) || undefined
      }

      const result = await createAgreement(agreementData)

      if (result) {
        setSuccess(true)
        setFormData({
          producerName: '',
          producerAddress: '',
          baseValue: '',
          hectares: '',
          locationLat: '',
          locationLng: '',
          durationDays: ''
        })
      }
    } catch (error) {
      console.error('Error creating agreement:', error)
    }
  }

  return (
    <div className="max-w-3xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Create New Agreement</h1>
          <p className="mt-2 text-gray-600">
            Register a new PES (Payment for Ecosystem Services) agreement
          </p>
        </div>

        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <FaPlus className="h-5 w-5 text-green-400" />
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

        <div className="bg-white shadow rounded-lg">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="producerName" className="block text-sm font-medium text-gray-700">
                  Producer Name
                </label>
                <input
                  type="text"
                  name="producerName"
                  id="producerName"
                  required
                  value={formData.producerName}
                  onChange={handleChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Enter producer name"
                />
              </div>

              <div>
                <label htmlFor="producerAddress" className="block text-sm font-medium text-gray-700">
                  Producer Address
                </label>
                <input
                  type="text"
                  name="producerAddress"
                  id="producerAddress"
                  required
                  value={formData.producerAddress}
                  onChange={handleChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="0x..."
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="baseValue" className="block text-sm font-medium text-gray-700">
                  Base Value (HBAR per hectare)
                </label>
                <input
                  type="number"
                  name="baseValue"
                  id="baseValue"
                  required
                  min="1"
                  value={formData.baseValue}
                  onChange={handleChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="100"
                />
              </div>

              <div>
                <label htmlFor="hectares" className="block text-sm font-medium text-gray-700">
                  Area (hectares)
                </label>
                <input
                  type="number"
                  name="hectares"
                  id="hectares"
                  required
                  min="1"
                  value={formData.hectares}
                  onChange={handleChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="50"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
              <div>
                <label htmlFor="locationLat" className="block text-sm font-medium text-gray-700">
                  <FaMapMarkerAlt className="inline h-4 w-4 mr-1" />
                  Latitude
                </label>
                <input
                  type="number"
                  step="any"
                  name="locationLat"
                  id="locationLat"
                  value={formData.locationLat}
                  onChange={handleChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="-23.5505"
                />
              </div>

              <div>
                <label htmlFor="locationLng" className="block text-sm font-medium text-gray-700">
                  <FaMapMarkerAlt className="inline h-4 w-4 mr-1" />
                  Longitude
                </label>
                <input
                  type="number"
                  step="any"
                  name="locationLng"
                  id="locationLng"
                  value={formData.locationLng}
                  onChange={handleChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="-46.6333"
                />
              </div>

              <div>
                <label htmlFor="durationDays" className="block text-sm font-medium text-gray-700">
                  Duration (days)
                </label>
                <input
                  type="number"
                  name="durationDays"
                  id="durationDays"
                  min="1"
                  value={formData.durationDays}
                  onChange={handleChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="365"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    <FaPlus className="h-4 w-4 mr-2" />
                    Create Agreement
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
