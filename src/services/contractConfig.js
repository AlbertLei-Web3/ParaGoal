// Contract configuration and environment bindings (UI-friendly, no secrets)
// Fill CONTRACT_ABI with your deployed contract ABI to enable on-chain calls.

export const CONTRACT_ADDRESS = import.meta.env.VITE_PUBLIC_CONTRACT_ADDRESS || ''

// IMPORTANT: Paste your Solidity contract ABI here as a JS array when available.
// Example: export const CONTRACT_ABI = [{ "type": "function", ... }]
export const CONTRACT_ABI = []

// Optional function names to drive the /test page without editing code.
// e.g. VITE_PUBLIC_WRITE_FUNC=stake  VITE_PUBLIC_READ_FUNC=pendingPayout
export const WRITE_FUNC = import.meta.env.VITE_PUBLIC_WRITE_FUNC || ''
export const READ_FUNC = import.meta.env.VITE_PUBLIC_READ_FUNC || ''

// Optional explorer base URL, e.g. https://paseo.subscan.io (or EVM explorer)
export const EXPLORER_BASE_URL = import.meta.env.VITE_PUBLIC_EXPLORER_URL || ''


