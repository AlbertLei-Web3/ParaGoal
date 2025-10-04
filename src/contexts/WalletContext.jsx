// Wallet context for global state management
// English: Provides wallet connection state and account info across the app
import React, { createContext, useContext, useState, useEffect } from 'react'
import { createConfig, http } from 'wagmi'
import { mainnet, sepolia } from 'wagmi/chains'
import { injected, metaMask } from 'wagmi/connectors'
import { WagmiProvider, useAccount, useConnect, useDisconnect } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// Create a custom chain for Paseo (placeholder - replace with actual Paseo config)
const paseo = {
  id: 8888, // Replace with actual Paseo chain ID
  name: 'Paseo Testnet',
  network: 'paseo',
  nativeCurrency: {
    decimals: 18,
    name: 'PAS',
    symbol: 'PAS',
  },
  rpcUrls: {
    default: { http: [import.meta.env.VITE_PUBLIC_RPC_URL || 'https://rpc.paseo.io'] },
    public: { http: [import.meta.env.VITE_PUBLIC_RPC_URL || 'https://rpc.paseo.io'] },
  },
  blockExplorers: {
    default: { name: 'Paseo Explorer', url: 'https://paseo.subscan.io' },
  },
  testnet: true,
}

// Wagmi config
const config = createConfig({
  chains: [paseo, mainnet, sepolia],
  connectors: [injected(), metaMask()],
  transports: {
    [paseo.id]: http(),
    [mainnet.id]: http(),
    [sepolia.id]: http(),
  },
})

const queryClient = new QueryClient()

// Wallet context
const WalletContext = createContext()

export function WalletProvider({ children }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <WalletContextProvider>{children}</WalletContextProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}

function WalletContextProvider({ children }) {
  const { address, isConnected, chainId } = useAccount()
  const { connect, connectors, isPending } = useConnect()
  const { disconnect } = useDisconnect()

  const [isCorrectNetwork, setIsCorrectNetwork] = useState(false)

  useEffect(() => {
    // Check if connected to Paseo testnet
    const expectedChainId = Number(import.meta.env.VITE_PUBLIC_CHAIN_ID) || 8888
    setIsCorrectNetwork(isConnected && chainId === expectedChainId)
  }, [isConnected, chainId])

  const value = {
    address,
    isConnected,
    chainId,
    isCorrectNetwork,
    connect,
    connectors,
    isPending,
    disconnect,
  }

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  )
}

export function useWallet() {
  const context = useContext(WalletContext)
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider')
  }
  return context
}
