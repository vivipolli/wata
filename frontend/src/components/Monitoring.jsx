import { useState, useEffect } from 'react'
import { FaWater, FaCheckCircle, FaTimesCircle, FaPlay } from 'react-icons/fa'

export default function Monitoring({ agreements, readings, onRefresh }) {
    const [selectedAgreement, setSelectedAgreement] = useState(null)
    const [agreementReadings, setAgreementReadings] = useState([])
    const [agreementStats, setAgreementStats] = useState(null)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (selectedAgreement) {
            fetchAgreementData(selectedAgreement.id)
        }
    }, [selectedAgreement])

    const fetchAgreementData = async (agreementId) => {
        setLoading(true)
        try {
            const [readingsResponse, statsResponse] = await Promise.all([
                fetch(`http://localhost:3001/api/readings/agreement/${agreementId}`),
                fetch(`http://localhost:3001/api/readings/agreement/${agreementId}/stats`)
            ])

            const readingsData = await readingsResponse.json()
            const statsData = await statsResponse.json()

            if (readingsData.success) {
                setAgreementReadings(readingsData.readings)
            }
            if (statsData.success) {
                setAgreementStats(statsData.stats)
            }
        } catch (error) {
            console.error('Error fetching agreement data:', error)
        } finally {
            setLoading(false)
        }
    }

    const triggerPaymentCheck = async (agreementId) => {
        try {
            const response = await fetch(`http://localhost:3001/api/payments/trigger-check/${agreementId}`, {
                method: 'POST'
            })

            const data = await response.json()

            if (data.success) {
                alert(data.result.message)
                if (data.result.success) {
                    onRefresh()
                }
            } else {
                alert('Error: ' + data.error)
            }
        } catch (error) {
            console.error('Error triggering payment check:', error)
            alert('Error triggering payment check')
        }
    }

    const simulateReading = async (agreementId) => {
        try {
            const response = await fetch('http://localhost:3001/api/readings/simulate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    agreementId: agreementId,
                    locationLat: -23.5505,
                    locationLng: -46.6333
                })
            })

            if (response.ok) {
                if (selectedAgreement && selectedAgreement.id === agreementId) {
                    fetchAgreementData(agreementId)
                }
                onRefresh()
            }
        } catch (error) {
            console.error('Error simulating reading:', error)
        }
    }

    return (
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            <div className="px-4 py-6 sm:px-0">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Water Quality Monitoring</h1>
                    <p className="mt-2 text-gray-600">
                        Monitor water quality readings and manage compliance
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-1">
                        <div className="bg-white shadow rounded-lg p-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">
                                Select Agreement
                            </h3>
                            <div className="space-y-3">
                                {agreements.map((agreement) => (
                                    <button
                                        key={agreement.id}
                                        onClick={() => setSelectedAgreement(agreement)}
                                        className={`w-full text-left p-3 rounded-lg border transition-colors ${selectedAgreement?.id === agreement.id
                                            ? 'border-blue-500 bg-blue-50'
                                            : 'border-gray-200 hover:bg-gray-50'
                                            }`}
                                    >
                                        <div className="font-medium text-gray-900">
                                            {agreement.producer_name}
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            {agreement.hectares} hectares • {agreement.base_value} HBAR/ha
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-2">
                        {selectedAgreement ? (
                            <div className="space-y-6">
                                <div className="bg-white shadow rounded-lg p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-lg font-medium text-gray-900">
                                            {selectedAgreement.producer_name}
                                        </h3>
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={() => simulateReading(selectedAgreement.id)}
                                                className="bg-green-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-green-700"
                                            >
                                                <FaWater className="inline h-4 w-4 mr-1" />
                                                Simulate Reading
                                            </button>
                                            <button
                                                onClick={() => triggerPaymentCheck(selectedAgreement.id)}
                                                className="bg-blue-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
                                            >
                                                <FaPlay className="inline h-4 w-4 mr-1" />
                                                Check Payment
                                            </button>
                                        </div>
                                    </div>

                                    {agreementStats && (
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                                            <div className="text-center">
                                                <div className="text-2xl font-bold text-gray-900">
                                                    {agreementStats.totalReadings}
                                                </div>
                                                <div className="text-sm text-gray-500">Total Readings</div>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-2xl font-bold text-gray-900">
                                                    {agreementStats.averageTurbidity} NTU
                                                </div>
                                                <div className="text-sm text-gray-500">Avg Turbidity</div>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-2xl font-bold text-gray-900">
                                                    {agreementStats.complianceRate}%
                                                </div>
                                                <div className="text-sm text-gray-500">Compliance</div>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-2xl font-bold text-gray-900">
                                                    {agreementStats.days}
                                                </div>
                                                <div className="text-sm text-gray-500">Days</div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="bg-white shadow rounded-lg p-6">
                                    <h4 className="text-lg font-medium text-gray-900 mb-4">
                                        Recent Readings
                                    </h4>

                                    {loading ? (
                                        <div className="text-center py-8">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                                            <p className="mt-2 text-gray-500">Loading readings...</p>
                                        </div>
                                    ) : (
                                        <div className="overflow-x-auto">
                                            <table className="min-w-full divide-y divide-gray-200">
                                                <thead className="bg-gray-50">
                                                    <tr>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                            Date
                                                        </th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                            Turbidity
                                                        </th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                            Status
                                                        </th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                            Type
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody className="bg-white divide-y divide-gray-200">
                                                    {agreementReadings.map((reading) => (
                                                        <tr key={reading.id}>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                                {new Date(reading.timestamp).toLocaleString()}
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                                {reading.turbidity_ntu.toFixed(1)} NTU
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                {reading.turbidity_ntu <= 10 ? (
                                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                                        <FaCheckCircle className="h-3 w-3 mr-1" />
                                                                        Compliant
                                                                    </span>
                                                                ) : (
                                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                                                        <FaTimesCircle className="h-3 w-3 mr-1" />
                                                                        Non-compliant
                                                                    </span>
                                                                )}
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                                {reading.is_simulated ? 'Simulated' : 'Real'}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="bg-white shadow rounded-lg p-12 text-center">
                                <FaWater className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">
                                    Select an Agreement
                                </h3>
                                <p className="text-gray-500">
                                    Choose an agreement from the list to view monitoring data
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
