import React, { ReactNode } from 'react'
import { WagmiProvider } from 'wagmi'
import { QueryClientProvider } from '@tanstack/react-query'
import { config, queryClient } from '../config/wagmi'

interface WagmiProviderProps {
  children: ReactNode
}

export const WagmiProviderWrapper: React.FC<WagmiProviderProps> = ({ children }) => {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  )
}
