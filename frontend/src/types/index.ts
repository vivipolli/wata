// API Response Types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// Agreement Types
export interface Agreement {
  id: number
  agreement_hash: string
  producer_name: string
  producer_address: string
  base_value: number
  hectares: number
  location_lat?: number
  location_lng?: number
  duration_days?: number
  created_at: string
  is_active: boolean
}

export interface CreateAgreementData {
  producerName: string
  producerAddress: string
  baseValue: number
  hectares: number
  locationLat?: number
  locationLng?: number
  durationDays?: number
}

// Reading Types
export interface Reading {
  id: number
  agreement_id: number
  turbidity_ntu: number
  timestamp: string
  location_lat?: number
  location_lng?: number
  is_simulated: boolean
  audit_hash?: string
  producer_name?: string
  producer_address?: string
}

export interface ReadingStats {
  totalReadings: number
  averageTurbidity: number
  minTurbidity: number
  maxTurbidity: number
  complianceRate: number
  days: number
}

export interface CreateReadingData {
  agreementId: number
  turbidityNtu: number
  locationLat?: number
  locationLng?: number
  isSimulated?: boolean
}

export interface SimulateReadingData {
  agreementId: number
  locationLat?: number
  locationLng?: number
}

// Payment Types
export interface Payment {
  id: number
  agreement_id: number
  amount: number
  transaction_hash?: string
  status: PaymentStatus
  created_at: string
  processed_at?: string
}

export type PaymentStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled'

export interface PaymentStats {
  pendingPayments: number
  totalPendingAmount: number
}

export interface PaymentCheckResult {
  success: boolean
  message: string
  averageTurbidity?: number
  amount?: number
  threshold?: number
}

// Health Types
export interface HealthData {
  status: string
  timestamp: string
  network?: string
}

// Water Quality Types
export interface WaterQualityStatus {
  min: number
  max: number
  label: string
  color: string
}

export interface ComplianceStatus {
  isCompliant: boolean
  averageTurbidity: number
  threshold: number
  complianceRate: number
  totalReadings: number
}

// Location Types
export interface Location {
  lat: number
  lng: number
}

// Hook Return Types
export interface UseAgreementsReturn {
  agreements: Agreement[]
  loading: boolean
  error: string | null
  fetchAgreements: () => Promise<void>
  createAgreement: (data: CreateAgreementData) => Promise<Agreement | null>
  getAgreement: (id: number) => Promise<Agreement | null>
  getAgreementPayments: (agreementId: number) => Promise<Payment[]>
}

export interface UseReadingsReturn {
  readings: Reading[]
  loading: boolean
  error: string | null
  fetchRecentReadings: (limit?: number) => Promise<void>
  fetchAgreementReadings: (agreementId: number, limit?: number) => Promise<void>
  getReadingStats: (agreementId: number, days?: number) => Promise<ReadingStats | null>
  simulateReading: (agreementId: number, location?: Location) => Promise<Reading | null>
  submitReading: (data: CreateReadingData) => Promise<Reading | null>
  getComplianceStatus: (agreementId: number, threshold?: number) => Promise<ComplianceStatus | null>
}

export interface UsePaymentsReturn {
  payments: Payment[]
  loading: boolean
  error: string | null
  fetchAgreementPayments: (agreementId: number) => Promise<void>
  fetchPendingPayments: () => Promise<void>
  triggerPaymentCheck: (agreementId: number) => Promise<PaymentCheckResult | null>
  processPayment: (paymentId: number) => Promise<any>
  getPaymentStats: () => Promise<PaymentStats | null>
  getPaymentHistory: (filters?: any) => Promise<void>
}

export interface UseHealthReturn {
  isHealthy: boolean
  healthData: HealthData | null
  loading: boolean
  error: string | null
  checkHealth: () => Promise<void>
  ping: () => Promise<boolean>
  getSystemStatus: () => Promise<HealthData | null>
}

// Component Props Types
export interface HeaderProps {
  currentTab: string
  onTabChange: (tab: string) => void
  isHealthy?: boolean
}

export interface DashboardProps {}

export interface ContractRegistrationProps {}

export interface MonitoringProps {}

export interface NotificationsProps {}

// Form Types
export interface ContractFormData {
  producerName: string
  producerAddress: string
  baseValue: string
  hectares: string
  locationLat: string
  locationLng: string
  durationDays: string
}

// Notification Types
export interface Notification {
  id: number
  type: 'payment' | 'compliance' | 'audit' | 'info'
  title: string
  message: string
  timestamp: string
  read: boolean
}

export interface NotificationsProps {
  notifications?: Notification[]
}
