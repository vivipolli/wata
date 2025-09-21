import { useState, useEffect } from 'react'
import { FaWater, FaFileContract, FaDollarSign, FaChartLine } from 'react-icons/fa'

export default function Dashboard({ agreements, readings, onRefresh }) {
    const [stats, setStats] = useState({
        activeContracts: 0,
        pendingPayments: 0,
        lastTurbidity: 0,
        complianceRate: 0
    })

    useEffect(() => {
        calculateStats()
    }, [agreements, readings])

    const calculateStats = () => {
        const activeContracts = agreements.filter(a => a.is_active).length

        const recentReadings = readings.slice(0, 10)
        const lastTurbidity = recentReadings.length > 0 ? recentReadings[0].turbidity_ntu : 0

        const compliantReadings = recentReadings.filter(r => r.turbidity_ntu <= 10)
        const complianceRate = recentReadings.length > 0
            ? (compliantReadings.length / recentReadings.length) * 100
            : 0

        setStats({
            activeContracts,
            pendingPayments: 0, // Would be calculated from payments API
            lastTurbidity,
            complianceRate
        })
    }

    const simulateReading = async () => {
        try {
            const response = await fetch('http://localhost:3001/api/readings/simulate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    agreementId: agreements[0]?.id || 1,
                    locationLat: -23.5505,
                    locationLng: -46.6333
                })
            })

            if (response.ok) {
                onRefresh()
            }
        } catch (error) {
            console.error('Error simulating reading:', error)
        }
    }

    const StatCard = ({ title, value, icon: Icon, color, subtitle }) => (
        <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
                <div className="flex items-center">
                    <div className="flex-shrink-0">
                        <Icon className={`h-6 w-6 ${color}`} />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                        <dl>
                            <dt className="text-sm font-medium text-gray-500 truncate">
                                {title}
                            </dt>
                            <dd className="flex items-baseline">
                                <div className="text-2xl font-semibold text-gray-900">
                                    {value}
                                </div>
                                {subtitle && (
                                    <div className="ml-2 text-sm text-gray-500">
                                        {subtitle}
                                    </div>
                                )}
                            </dd>
                        </dl>
                    </div>
                </div>
            </div>
        </div>
    )

    return (
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            <div className="px-4 py-6 sm:px-0">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                    <p className="mt-2 text-gray-600">
                        Monitor water quality and manage PES agreements
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
                    <StatCard
                        title="Active Contracts"
                        value={stats.activeContracts}
                        icon={FaFileContract}
                        color="text-blue-600"
                    />
                    <StatCard
                        title="Pending Payments"
                        value={stats.pendingPayments}
                        icon={FaDollarSign}
                        color="text-green-600"
                    />
                    <StatCard
                        title="Last Turbidity"
                        value={`${stats.lastTurbidity.toFixed(1)} NTU`}
                        icon={FaWater}
                        color="text-cyan-600"
                        subtitle={stats.lastTurbidity <= 10 ? "Good" : "Poor"}
                    />
                    <StatCard
                        title="Compliance Rate"
                        value={`${stats.complianceRate.toFixed(1)}%`}
                        icon={FaChartLine}
                        color="text-purple-600"
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="bg-white shadow rounded-lg p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-medium text-gray-900">
                                Recent Turbidity Readings
                            </h3>
                            <button
                                onClick={simulateReading}
                                className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
                            >
                                Simulate Reading
                            </button>
                        </div>
                        <div className="space-y-3">
                            {readings.slice(0, 5).map((reading) => (
                                <div key={reading.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">
                                            {reading.producer_name || 'Unknown Producer'}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {new Date(reading.timestamp).toLocaleString()}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${reading.turbidity_ntu <= 10
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-red-100 text-red-800'
                                            }`}>
                                            {reading.turbidity_ntu.toFixed(1)} NTU
                                        </span>
                                        {reading.is_simulated && (
                                            <p className="text-xs text-gray-400 mt-1">Simulated</p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white shadow rounded-lg p-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">
                            Active Agreements
                        </h3>
                        <div className="space-y-3">
                            {agreements.slice(0, 5).map((agreement) => (
                                <div key={agreement.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">
                                            {agreement.producer_name}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {agreement.hectares} hectares • {agreement.base_value} HBAR/ha
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                                            Active
                                        </span>
                                        <p className="text-xs text-gray-400 mt-1">
                                            ID: {agreement.id}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
