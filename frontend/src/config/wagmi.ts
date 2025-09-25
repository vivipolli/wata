import { createConfig, http } from 'wagmi'
import { mainnet, sepolia, arbitrum, polygon } from 'wagmi/chains'
import { injected, metaMask, walletConnect } from 'wagmi/connectors'
import { QueryClient } from '@tanstack/react-query'

// Query client for React Query
export const queryClient = new QueryClient()

// Wagmi configuration
export const config = createConfig({
  chains: [mainnet, sepolia, arbitrum, polygon],
  connectors: [
    injected(),
    metaMask({
      dappMetadata: {
        name: 'W.A.T.A. Chain',
        url: 'https://wata-chain.com',
        iconUrl: 'https://wata-chain.com/icon.png',
      },
    }),
    walletConnect({
      projectId: process.env.VITE_WALLETCONNECT_PROJECT_ID || 'your-project-id',
    }),
  ],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
    [arbitrum.id]: http(),
    [polygon.id]: http(),
  },
})

// Declare module for TypeScript
declare module 'wagmi' {
  interface Register {
    config: typeof config
  }
}
