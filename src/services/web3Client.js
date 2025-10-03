// Minimal viem client setup (UI placeholder until contract is ready)
import { createPublicClient, http } from 'viem'

export function getPublicClient() {
  const rpc = import.meta.env.VITE_PUBLIC_RPC_URL
  if (!rpc) {
    throw new Error('VITE_PUBLIC_RPC_URL is not set')
  }
  return createPublicClient({ transport: http(rpc) })
}


