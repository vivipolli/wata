import { describe, it, expect, beforeEach, jest } from '@jest/globals'
import { render, screen, waitFor } from '@testing-library/react'
import { InvestorDashboard } from '../InvestorDashboard'

// Mock the Hedera service
jest.mock('../../services/hedera', () => ({
  getAccountBalance: jest.fn(),
  getAccountInfo: jest.fn()
}))

// Mock the API service
jest.mock('../../services/api', () => ({
  getAgreements: jest.fn(),
  getPayments: jest.fn(),
  getInvestments: jest.fn()
}))

describe('InvestorDashboard', () => {
  const mockUser = {
    id: '1',
    name: 'Test Investor',
    role: 'investidor',
    address: '0.0.789012'
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render investor dashboard with correct title', async () => {
    const { getAgreements, getPayments, getInvestments } = require('../../services/api')
    const { getAccountBalance } = require('../../services/hedera')

    // Mock API responses
    getAgreements.mockResolvedValue([
      {
        id: 1,
        agreementHash: 'test-hash-1',
        producerName: 'Test Producer',
        producerAddress: '0.0.123456',
        investorAddress: '0.0.789012',
        baseValue: 100,
        hectares: 50,
        isActive: true,
        totalInvested: 10000,
        totalPaid: 5000
      }
    ])

    getPayments.mockResolvedValue([
      {
        id: 1,
        agreementId: 1,
        amount: 5000,
        status: 'completed',
        score: 85,
        auditHash: 'audit-hash-123',
        hcsTransactionId: '0.0.123456@1234567890',
        hfsFileId: '0.0.789012',
        investorAddress: '0.0.789012',
        createdAt: '2024-01-01T00:00:00Z'
      }
    ])

    getInvestments.mockResolvedValue([
      {
        id: 1,
        agreementId: 1,
        investorAddress: '0.0.789012',
        amount: 10000,
        transactionHash: '0xinvestment123',
        createdAt: '2024-01-01T00:00:00Z'
      }
    ])

    getAccountBalance.mockResolvedValue('50000000000') // 500 HBAR

    render(<InvestorDashboard user={mockUser} />)

    await waitFor(() => {
      expect(screen.getByText('Painel do Investidor')).toBeInTheDocument()
    })

    expect(screen.getByText('Test Investor')).toBeInTheDocument()
    expect(screen.getByText('0.0.789012')).toBeInTheDocument()
  })

  it('should display HBAR balance', async () => {
    const { getAgreements, getPayments, getInvestments } = require('../../services/api')
    const { getAccountBalance } = require('../../services/hedera')

    getAgreements.mockResolvedValue([])
    getPayments.mockResolvedValue([])
    getInvestments.mockResolvedValue([])
    getAccountBalance.mockResolvedValue('100000000000') // 1000 HBAR

    render(<InvestorDashboard user={mockUser} />)

    await waitFor(() => {
      expect(screen.getByText('1,000.00 HBAR')).toBeInTheDocument()
    })
  })

  it('should display active contracts and investments', async () => {
    const { getAgreements, getInvestments } = require('../../services/api')

    getAgreements.mockResolvedValue([
      {
        id: 1,
        agreementHash: 'test-hash-1',
        producerName: 'Test Producer 1',
        producerAddress: '0.0.123456',
        investorAddress: '0.0.789012',
        baseValue: 100,
        hectares: 50,
        isActive: true,
        totalInvested: 10000,
        totalPaid: 5000
      },
      {
        id: 2,
        agreementHash: 'test-hash-2',
        producerName: 'Test Producer 2',
        producerAddress: '0.0.123457',
        investorAddress: '0.0.789012',
        baseValue: 200,
        hectares: 30,
        isActive: true,
        totalInvested: 6000,
        totalPaid: 0
      }
    ])

    getInvestments.mockResolvedValue([
      {
        id: 1,
        agreementId: 1,
        investorAddress: '0.0.789012',
        amount: 10000,
        transactionHash: '0xinvestment123',
        createdAt: '2024-01-01T00:00:00Z'
      },
      {
        id: 2,
        agreementId: 2,
        investorAddress: '0.0.789012',
        amount: 6000,
        transactionHash: '0xinvestment456',
        createdAt: '2024-01-02T00:00:00Z'
      }
    ])

    render(<InvestorDashboard user={mockUser} />)

    await waitFor(() => {
      expect(screen.getByText('Test Producer 1')).toBeInTheDocument()
      expect(screen.getByText('Test Producer 2')).toBeInTheDocument()
      expect(screen.getByText('10,000')).toBeInTheDocument()
      expect(screen.getByText('6,000')).toBeInTheDocument()
    })
  })

  it('should display environmental impact KPIs', async () => {
    const { getAgreements, getPayments } = require('../../services/api')

    getAgreements.mockResolvedValue([
      {
        id: 1,
        agreementHash: 'test-hash-1',
        producerName: 'Test Producer',
        producerAddress: '0.0.123456',
        investorAddress: '0.0.789012',
        baseValue: 100,
        hectares: 50,
        isActive: true,
        totalInvested: 10000,
        totalPaid: 5000
      }
    ])

    getPayments.mockResolvedValue([
      {
        id: 1,
        agreementId: 1,
        amount: 5000,
        status: 'completed',
        score: 85,
        auditHash: 'audit-hash-123',
        hcsTransactionId: '0.0.123456@1234567890',
        hfsFileId: '0.0.789012',
        investorAddress: '0.0.789012',
        createdAt: '2024-01-01T00:00:00Z'
      }
    ])

    render(<InvestorDashboard user={mockUser} />)

    await waitFor(() => {
      expect(screen.getByText('85')).toBeInTheDocument() // Average score
      expect(screen.getByText('50')).toBeInTheDocument() // Total hectares
      expect(screen.getByText('1')).toBeInTheDocument() // Active contracts
    })
  })

  it('should display investment and payment history', async () => {
    const { getAgreements, getPayments, getInvestments } = require('../../services/api')

    getAgreements.mockResolvedValue([
      {
        id: 1,
        agreementHash: 'test-hash-1',
        producerName: 'Test Producer',
        producerAddress: '0.0.123456',
        investorAddress: '0.0.789012',
        baseValue: 100,
        hectares: 50,
        isActive: true,
        totalInvested: 10000,
        totalPaid: 5000
      }
    ])

    getPayments.mockResolvedValue([
      {
        id: 1,
        agreementId: 1,
        amount: 5000,
        status: 'completed',
        score: 85,
        auditHash: 'audit-hash-123',
        hcsTransactionId: '0.0.123456@1234567890',
        hfsFileId: '0.0.789012',
        investorAddress: '0.0.789012',
        createdAt: '2024-01-01T00:00:00Z'
      }
    ])

    getInvestments.mockResolvedValue([
      {
        id: 1,
        agreementId: 1,
        investorAddress: '0.0.789012',
        amount: 10000,
        transactionHash: '0xinvestment123',
        createdAt: '2024-01-01T00:00:00Z'
      }
    ])

    render(<InvestorDashboard user={mockUser} />)

    await waitFor(() => {
      expect(screen.getByText('5,000')).toBeInTheDocument() // Payment amount
      expect(screen.getByText('10,000')).toBeInTheDocument() // Investment amount
    })

    // Check for HCS/HFS links in payment history
    const hcsLink = screen.getByText('0.0.123456@1234567890')
    const hfsLink = screen.getByText('0.0.789012')
    
    expect(hcsLink).toBeInTheDocument()
    expect(hfsLink).toBeInTheDocument()
  })

  it('should handle empty state when no investments exist', async () => {
    const { getAgreements, getPayments, getInvestments } = require('../../services/api')

    getAgreements.mockResolvedValue([])
    getPayments.mockResolvedValue([])
    getInvestments.mockResolvedValue([])

    render(<InvestorDashboard user={mockUser} />)

    await waitFor(() => {
      expect(screen.getByText('Nenhum investimento encontrado')).toBeInTheDocument()
    })
  })

  it('should handle loading state', () => {
    const { getAgreements } = require('../../services/api')

    getAgreements.mockImplementation(() => new Promise(() => {})) // Never resolves

    render(<InvestorDashboard user={mockUser} />)

    expect(screen.getByText('Carregando...')).toBeInTheDocument()
  })

  it('should handle API errors gracefully', async () => {
    const { getAgreements } = require('../../services/api')

    getAgreements.mockRejectedValue(new Error('API Error'))

    render(<InvestorDashboard user={mockUser} />)

    await waitFor(() => {
      expect(screen.getByText('Erro ao carregar dados')).toBeInTheDocument()
    })
  })
})
