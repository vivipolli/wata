import { describe, it, expect, beforeEach, jest } from '@jest/globals'
import { render, screen, waitFor } from '@testing-library/react'
import { ProducerDashboard } from '../ProducerDashboard'

// Mock the Hedera service
jest.mock('../../services/hedera', () => ({
  getAccountBalance: jest.fn(),
  getAccountInfo: jest.fn()
}))

// Mock the API service
jest.mock('../../services/api', () => ({
  getAgreements: jest.fn(),
  getPayments: jest.fn(),
  getBatches: jest.fn()
}))

describe('ProducerDashboard', () => {
  const mockUser = {
    id: '1',
    name: 'Test Producer',
    role: 'produtor',
    address: '0.0.123456'
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render producer dashboard with correct title', async () => {
    const { getAgreements, getPayments, getBatches } = require('../../services/api')
    const { getAccountBalance } = require('../../services/hedera')

    // Mock API responses
    getAgreements.mockResolvedValue([
      {
        id: 1,
        agreementHash: 'test-hash-1',
        producerName: 'Test Producer',
        producerAddress: '0.0.123456',
        baseValue: 100,
        hectares: 50,
        isActive: true,
        createdAt: '2024-01-01T00:00:00Z',
        lastScore: 85,
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
        createdAt: '2024-01-01T00:00:00Z'
      }
    ])

    getBatches.mockResolvedValue([
      {
        id: 1,
        agreementId: 1,
        auditHash: 'audit-hash-123',
        score: 85,
        readingsCount: 10,
        averageTurbidity: 5.2,
        validationStatus: 'submitted',
        createdAt: '2024-01-01T00:00:00Z'
      }
    ])

    getAccountBalance.mockResolvedValue('10000000000') // 100 HBAR

    render(<ProducerDashboard user={mockUser} />)

    await waitFor(() => {
      expect(screen.getByText('Painel do Produtor')).toBeInTheDocument()
    })

    expect(screen.getByText('Test Producer')).toBeInTheDocument()
    expect(screen.getByText('0.0.123456')).toBeInTheDocument()
  })

  it('should display weekly oracle score', async () => {
    const { getAgreements, getBatches } = require('../../services/api')

    getAgreements.mockResolvedValue([
      {
        id: 1,
        agreementHash: 'test-hash-1',
        producerName: 'Test Producer',
        producerAddress: '0.0.123456',
        baseValue: 100,
        hectares: 50,
        isActive: true,
        lastScore: 85
      }
    ])

    getBatches.mockResolvedValue([
      {
        id: 1,
        agreementId: 1,
        score: 85,
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days ago
      }
    ])

    render(<ProducerDashboard user={mockUser} />)

    await waitFor(() => {
      expect(screen.getByText('85')).toBeInTheDocument()
    })
  })

  it('should display contract status', async () => {
    const { getAgreements } = require('../../services/api')

    getAgreements.mockResolvedValue([
      {
        id: 1,
        agreementHash: 'test-hash-1',
        producerName: 'Test Producer',
        producerAddress: '0.0.123456',
        baseValue: 100,
        hectares: 50,
        isActive: true
      }
    ])

    render(<ProducerDashboard user={mockUser} />)

    await waitFor(() => {
      expect(screen.getByText('Ativo')).toBeInTheDocument()
    })
  })

  it('should display payment history with HCS/HFS links', async () => {
    const { getAgreements, getPayments } = require('../../services/api')

    getAgreements.mockResolvedValue([
      {
        id: 1,
        agreementHash: 'test-hash-1',
        producerName: 'Test Producer',
        producerAddress: '0.0.123456',
        baseValue: 100,
        hectares: 50,
        isActive: true
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
        createdAt: '2024-01-01T00:00:00Z'
      }
    ])

    render(<ProducerDashboard user={mockUser} />)

    await waitFor(() => {
      expect(screen.getByText('5,000')).toBeInTheDocument()
      expect(screen.getByText('85')).toBeInTheDocument()
    })

    // Check for HCS/HFS links
    const hcsLink = screen.getByText('0.0.123456@1234567890')
    const hfsLink = screen.getByText('0.0.789012')
    
    expect(hcsLink).toBeInTheDocument()
    expect(hfsLink).toBeInTheDocument()
  })

  it('should handle empty state when no agreements exist', async () => {
    const { getAgreements } = require('../../services/api')

    getAgreements.mockResolvedValue([])

    render(<ProducerDashboard user={mockUser} />)

    await waitFor(() => {
      expect(screen.getByText('Nenhum acordo encontrado')).toBeInTheDocument()
    })
  })

  it('should handle loading state', () => {
    const { getAgreements } = require('../../services/api')

    getAgreements.mockImplementation(() => new Promise(() => {})) // Never resolves

    render(<ProducerDashboard user={mockUser} />)

    expect(screen.getByText('Carregando...')).toBeInTheDocument()
  })

  it('should handle API errors gracefully', async () => {
    const { getAgreements } = require('../../services/api')

    getAgreements.mockRejectedValue(new Error('API Error'))

    render(<ProducerDashboard user={mockUser} />)

    await waitFor(() => {
      expect(screen.getByText('Erro ao carregar dados')).toBeInTheDocument()
    })
  })
})
