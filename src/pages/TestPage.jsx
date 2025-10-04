// /test page for hackathon prototype
// English: Minimal test page for judges to verify the core on-chain action (UI placeholders for now).
import React from 'react'
import { GlowCard } from '../components/GlowCard'
import { getApi } from '../services/web3Client'
import { CONTRACT_ADDRESS, CONTRACT_ABI, WRITE_FUNC, READ_FUNC, EXPLORER_BASE_URL } from '../services/contractConfig'

export function TestPage() {
  // Placeholder states; will be wired to real chain later
  const [connected, setConnected] = React.useState(false)
  const [network, setNetwork] = React.useState('Unknown')
  const [contract, setContract] = React.useState(CONTRACT_ADDRESS || '0x...')
  const [txHash, setTxHash] = React.useState('')
  const [readValue, setReadValue] = React.useState('')

  // 检测网络连接状态（简化为Polkadot API）
  // English: Detect network connection status (simplified for Polkadot API)
  React.useEffect(() => {
    const detectNetwork = async () => {
      try {
        const api = await getApi()
        const chainId = api.genesisHash.toHex()
        setNetwork(`Paseo (${chainId.slice(0, 8)}...)`)
      } catch (error) {
        console.error('网络检测错误 / Network detection error:', error)
        setNetwork('连接失败 / Connection failed')
      }
    }
    detectNetwork()
  }, [])

  // Placeholder click logic: UI only
  async function handleWriteAction() {
    // After integration: call core write (e.g., stake/inject/settle), get tx hash, then read key value.
    if (!CONTRACT_ADDRESS || CONTRACT_ABI.length === 0 || !WRITE_FUNC) {
      alert('Configure CONTRACT_ABI/ADDRESS and WRITE_FUNC envs to enable write.')
      setTxHash('')
      setReadValue('')
      return
    }
    // NOTE: For MVP, we still keep this as UI placeholder. Wire wallet + viem writeContract later.
    alert('UI placeholder: wallet write will be wired with viem soon.')
    setTxHash('0x_tx_hash_placeholder')
    setReadValue('on-chain read placeholder')
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">/test — Prototype Engine</h1>

      <GlowCard className="p-4">
        {/* Security & scope notes required by organizer */}
        <div className="text-xs text-slate-400 mb-3">
          Testnet only. No real assets. Avoid exposing admin-only functions. No private keys stored in front-end. Page is noindex.
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <div className="space-y-1">
            <div className="text-slate-400 text-sm">Wallet Connection</div>
            <div className="text-slate-200 font-medium">{connected ? 'Connected' : 'Not Connected'}</div>
          </div>
          <div className="space-y-1">
            <div className="text-slate-400 text-sm">Network</div>
            <div className="text-slate-200 font-medium">{network} (expect Paseo)</div>
          </div>
          <div className="space-y-1 md:col-span-2">
            <div className="text-slate-400 text-sm">Contract Address</div>
            <div className="text-slate-200 font-mono break-all">
              {EXPLORER_BASE_URL ? (
                <a className="text-yellow-400 hover:underline" href={`${EXPLORER_BASE_URL}/address/${contract}`} target="_blank" rel="noreferrer">{contract}</a>
              ) : (
                <span>{contract}</span>
              )}
            </div>
          </div>
        </div>
      </GlowCard>

      <GlowCard className="p-4">
        <div className="flex flex-wrap items-center gap-3">
          <button className="rounded-md bg-blue-600 hover:bg-blue-700 text-white px-4 py-2" onClick={handleWriteAction}>
            Execute Core Write Function
          </button>
          <div className="text-slate-400 text-sm">Tx hash and read result will appear here after clicking</div>
        </div>
        <div className="mt-4 grid gap-2">
          <div className="text-slate-400 text-sm">Tx Hash</div>
          <div className="font-mono text-slate-200 break-all">{txHash || 'N/A'}</div>
          <div className="text-slate-400 text-sm mt-2">On-chain Read Result</div>
          <div className="font-mono text-slate-200 break-all">{readValue || 'N/A'}</div>
        </div>
      </GlowCard>

      <p className="text-sm text-slate-500">Note: This page is a UI skeleton for prototype verification. Real on-chain calls will be wired later.</p>
    </div>
  )
}


