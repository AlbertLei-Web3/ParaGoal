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

  // 真实的智能合约交互逻辑 / Real smart contract interaction logic
  async function handleWriteAction() {
    if (!CONTRACT_ADDRESS || CONTRACT_ABI.length === 0) {
      alert('请先部署合约并配置CONTRACT_ADDRESS和CONTRACT_ABI / Please deploy contract and configure CONTRACT_ADDRESS and CONTRACT_ABI')
      setTxHash('')
      setReadValue('')
      return
    }
    
    try {
      // 模拟注入奖池操作（使用内置比赛ID 1）/ Simulate pool injection (using built-in match ID 1)
      const matchId = 1
      const injectionAmount = '0.1' // 0.1 PAS
      
      // 这里需要集成真实的钱包连接和合约调用
      // Here we need to integrate real wallet connection and contract calls
      console.log(`模拟注入奖池: 比赛ID ${matchId}, 金额 ${injectionAmount} PAS`)
      console.log(`Simulating pool injection: Match ID ${matchId}, Amount ${injectionAmount} PAS`)
      
      // 模拟交易哈希 / Simulate transaction hash
      const simulatedTxHash = '0x' + Math.random().toString(16).substr(2, 64)
      setTxHash(simulatedTxHash)
      
      // 模拟读取结果 / Simulate read result
      const simulatedReadValue = `比赛${matchId}奖池总额: ${injectionAmount} PAS`
      setReadValue(simulatedReadValue)
      
      alert('注意：这是模拟操作，需要连接真实钱包和合约才能执行实际交易')
      alert('Note: This is a simulation. Real wallet connection and contract interaction required for actual transactions')
      
    } catch (error) {
      console.error('合约交互错误 / Contract interaction error:', error)
      alert('合约交互失败 / Contract interaction failed: ' + error.message)
      setTxHash('')
      setReadValue('')
    }
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
            Inject Pool (Match 1) / 注入奖池（比赛1）
          </button>
          <div className="text-slate-400 text-sm">点击按钮模拟注入奖池操作，交易哈希和读取结果将显示在下方</div>
          <div className="text-slate-400 text-sm">Click button to simulate pool injection, tx hash and read result will appear below</div>
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


