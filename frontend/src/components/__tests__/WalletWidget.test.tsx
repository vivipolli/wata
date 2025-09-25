import { describe, it, expect, beforeEach, jest } from '@jest/globals'
import { render, screen, waitFor } from '@testing-library/react'
import { WalletWidget } from '../WalletWidget'

// Mock the Hedera service
jest.mock('../../services/hedera', () => ({
  getAccountBalance: jest.fn(),
  getAccountInfo: jest.fn(),
  getTransactionHistory: jest.fn()
}))

describe('WalletWidget', () => {
  const mockUser = {
    id: '1',
    name: 'Test User',
    role: 'investidor',
    address: '0.0.789012'
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render wallet widget with HBAR balance', async () => {
    const { getAccountBalance, getAccountInfo } = require('../../services/hedera')

    getAccountBalance.mockResolvedValue('100000000000') // 1000 HBAR
    getAccountInfo.mockResolvedValue({
      accountId: '0.0.789012',
      balance: { toString: () => '100000000000' },
      key: { toString: () => '302e020100300506032b657004220420...' }
    })

    render(<WalletWidget user={mockUser} />)

    await waitFor(() => {
      expect(screen.getByText('Carteira HBAR')).toBeInTheDocument()
      expect(screen.getByText('1,000.00 HBAR')).toBeInTheDocument()
    })

    expect(screen.getByText('0.0.789012')).toBeInTheDocument()
  })

  it('should display transaction history', async () => {
    const { getAccountBalance, getAccountInfo, getTransactionHistory } = require('../../services/hedera')

    getAccountBalance.mockResolvedValue('100000000000')
    getAccountInfo.mockResolvedValue({
      accountId: '0.0.789012',
      balance: { toString: () => '100000000000' }
    })

    getTransactionHistory.mockResolvedValue([
      {
        transactionId: '0.0.123456@1234567890',
        type: 'CRYPTOTRANSFER',
        amount: '5000000000', // 50 HBAR
        timestamp: '2024-01-01T00:00:00Z',
        status: 'SUCCESS'
      },
      {
        transactionId: '0.0.123456@1234567891',
        type: 'CRYPTOTRANSFER',
        amount: '-1000000000', // -10 HBAR
        timestamp: '2024-01-02T00:00:00Z',
        status: 'SUCCESS'
      }
    ])

    render(<WalletWidget user={mockUser} />)

    await waitFor(() => {
      expect(screen.getByText('Histórico de Transações')).toBeInTheDocument()
    })

    // Check for transaction entries
    expect(screen.getByText('+50.00 HBAR')).toBeInTheDocument()
    expect(screen.getByText('-10.00 HBAR')).toBeInTheDocument()
    expect(screen.getByText('0.0.123456@1234567890')).toBeInTheDocument()
    expect(screen.getByText('0.0.123456@1234567891')).toBeInTheDocument()
  })

  it('should handle empty transaction history', async () => {
    const { getAccountBalance, getAccountInfo, getTransactionHistory } = require('../../services/hedera')

    getAccountBalance.mockResolvedValue('100000000000')
    getAccountInfo.mockResolvedValue({
      accountId: '0.0.789012',
      balance: { toString: () => '100000000000' }
    })
    getTransactionHistory.mockResolvedValue([])

    render(<WalletWidget user={mockUser} />)

    await waitFor(() => {
      expect(screen.getByText('Nenhuma transação encontrada')).toBeInTheDocument()
    })
  })

  it('should handle loading state', () => {
    const { getAccountBalance } = require('../../services/hedera')

    getAccountBalance.mockImplementation(() => new Promise(() => {})) // Never resolves

    render(<WalletWidget user={mockUser} />)

    expect(screen.getByText('Carregando saldo...')).toBeInTheDocument()
  })

  it('should handle API errors gracefully', async () => {
    const { getAccountBalance } = require('../../services/hedera')

    getAccountBalance.mockRejectedValue(new Error('API Error'))

    render(<WalletWidget user={mockUser} />)

    await waitFor(() => {
      expect(screen.getByText('Erro ao carregar saldo')).toBeInTheDocument()
    })
  })

  it('should format HBAR amounts correctly', async () => {
    const { getAccountBalance, getAccountInfo } = require('../../services/hedera')

    getAccountBalance.mockResolvedValue('1234567890') // 12.34567890 HBAR
    getAccountInfo.mockResolvedValue({
      accountId: '0.0.789012',
      balance: { toString: () => '1234567890' }
    })

    render(<WalletWidget user={mockUser} />)

    await waitFor(() => {
      expect(screen.getByText('12.35 HBAR')).toBeInTheDocument()
    })
  })

  it('should display account information', async () => {
    const { getAccountBalance, getAccountInfo } = require('../../services/hedera')

    getAccountBalance.mockResolvedValue('100000000000')
    getAccountInfo.mockResolvedValue({
      accountId: '0.0.789012',
      balance: { toString: () => '100000000000' },
      key: { toString: () => '302e020100300506032b657004220420...' }
    })

    render(<WalletWidget user={mockUser} />)

    await waitFor(() => {
      expect(screen.getByText('0.0.789012')).toBeInTheDocument()
    })
  })
})
