// IPFS storage service for team data persistence
// English: Handles saving/loading team data to/from IPFS via web3.storage
import { Web3Storage } from 'web3.storage'

// Get web3.storage token from environment
const getAccessToken = () => {
  return import.meta.env.VITE_WEB3_STORAGE_TOKEN
}

// Create Web3Storage client
const getClient = () => {
  const token = getAccessToken()
  if (!token) {
    throw new Error('VITE_WEB3_STORAGE_TOKEN is not set')
  }
  return new Web3Storage({ token })
}

// Save teams data to IPFS
export async function saveTeamsToIPFS(teams) {
  try {
    const client = getClient()
    const data = {
      teams,
      timestamp: Date.now(),
      version: '1.0'
    }
    
    const file = new File([JSON.stringify(data, null, 2)], 'teams.json', {
      type: 'application/json'
    })
    
    const cid = await client.put([file])
    return { success: true, cid }
  } catch (error) {
    console.error('Failed to save teams to IPFS:', error)
    return { success: false, error: error.message }
  }
}

// Load teams data from IPFS
export async function loadTeamsFromIPFS(cid) {
  try {
    const response = await fetch(`https://${cid}.ipfs.w3s.link/teams.json`)
    if (!response.ok) {
      throw new Error(`Failed to fetch: ${response.status}`)
    }
    
    const data = await response.json()
    return { success: true, teams: data.teams || [], timestamp: data.timestamp }
  } catch (error) {
    console.error('Failed to load teams from IPFS:', error)
    return { success: false, error: error.message }
  }
}

// Generate a deterministic CID for user's teams based on wallet address
export function generateUserCID(address) {
  // Simple hash-based CID generation (in real app, use proper hashing)
  return `user-${address?.slice(2, 10)}-teams`
}
