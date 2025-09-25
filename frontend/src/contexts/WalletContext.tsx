import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useAccount, useConnect, useDisconnect, useBalance } from 'wagmi'
import { hederaService } from '../services/hedera'

export interface WalletInfo {
  address: string
  balance: string
  balanceInHBAR: number
  isConnected: boolean
  network: string
}

interface WalletContextType {
  wallet: WalletInfo | null
  connectWallet: () => Promise<void>
  disconnectWallet: () => void
  refreshBalance: () => Promise<void>
  transferHBAR: (toAddress: string, amount: number) => Promise<{ success: boolean; transactionHash?: string; error?: string }>
  isLoading: boolean
  error: string | null
}

const WalletContext = createContext<WalletContextType | undefined>(undefined)

interface WalletProviderProps {
  children: ReactNode
}

export const WalletProvider: React.FC<WalletProviderProps> = ({ children }) => {
  const [wallet, setWallet] = useState<WalletInfo | null>(null)
  const [error, setError] = useState<string | null>(null)
  
  // Wagmi hooks
  const { address, isConnected, chain } = useAccount()
  const { connect, connectors, isPending } = useConnect()
  const { disconnect } = useDisconnect()
  const { data: balance } = useBalance({
    address: address,
  })

  const connectWallet = async (): Promise<void> => {
    try {
      setError(null)
      
      // Find MetaMask connector
      const metaMaskConnector = connectors.find(connector => 
        connector.name.toLowerCase().includes('metamask')
      )
      
      if (!metaMaskConnector) {
        throw new Error('MetaMask not found. Please install MetaMask extension.')
      }

      await connect({ connector: metaMaskConnector })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect wallet')
    }
  }

  const disconnectWallet = (): void => {
    disconnect()
    setWallet(null)
    localStorage.removeItem('wata_wallet')
  }

  const refreshBalance = async (): Promise<void> => {
    if (!wallet?.address && !address) return

    try {
      const targetAddress = wallet?.address || address
      if (!targetAddress) return

      const balance = await hederaService.getAccountBalance(targetAddress)
      const balanceInHBAR = parseFloat(balance)

      if (wallet) {
        const updatedWallet = {
          ...wallet,
          balance,
          balanceInHBAR
        }
        setWallet(updatedWallet)
        localStorage.setItem('wata_wallet', JSON.stringify(updatedWallet))
      }
    } catch (err) {
      console.error('Failed to refresh balance:', err)
    }
  }

  const transferHBAR = async (toAddress: string, amount: number): Promise<{ success: boolean; transactionHash?: string; error?: string }> => {
    if (!wallet?.isConnected && !isConnected) {
      return { success: false, error: 'Wallet not connected' }
    }

    try {
      const result = await hederaService.transferHBAR(toAddress, amount)
      
      if (result.success) {
        // Refresh balance after successful transfer
        await refreshBalance()
      }

      return result
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Transfer failed'
      }
    }
  }

  // Sync wallet state with Wagmi
  useEffect(() => {
    if (isConnected && address) {
      // Convert Ethereum address to Hedera format
      const convertEthereumToHedera = async (ethereumAddress: string): Promise<string> => {
        try {
          // In a real implementation, you would use HashConnect or similar
          // For now, we'll use a mock conversion
          const mockHederaAddress = "0.0.5904577"
          return mockHederaAddress
        } catch (error) {
          console.error('Error converting address:', error)
          throw new Error('Failed to convert Ethereum address to Hedera format')
        }
      }

      const updateWalletInfo = async () => {
        try {
          const hederaAddress = await convertEthereumToHedera(address)
          const balance = await hederaService.getAccountBalance(hederaAddress)
          const balanceInHBAR = parseFloat(balance)

          const walletInfo: WalletInfo = {
            address: hederaAddress,
            balance,
            balanceInHBAR,
            isConnected: true,
            network: chain?.name || 'testnet'
          }

          setWallet(walletInfo)
          localStorage.setItem('wata_wallet', JSON.stringify(walletInfo))
        } catch (err) {
          console.error('Error updating wallet info:', err)
        }
      }

      updateWalletInfo()
    } else {
      setWallet(null)
      localStorage.removeItem('wata_wallet')
    }
  }, [isConnected, address, chain])

  const value: WalletContextType = {
    wallet,
    connectWallet,
    disconnectWallet,
    refreshBalance,
    transferHBAR,
    isLoading: isPending,
    error
  }

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  )
}

export const useWallet = (): WalletContextType => {
  const context = useContext(WalletContext)
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider')
  }
  return context
}
