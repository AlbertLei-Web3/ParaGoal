// /test page for hackathon prototype
// Chinese: 简易自检页，展示当前链信息与 pallet-contracts 支持，并提供基本的合约写/读测试。
// English: Minimal diagnostics page showing chain info and pallet-contracts support, plus basic write/read tests.
import React from 'react'
import { GlowCard } from '../components/GlowCard'
import { getApi } from '../services/web3Client'
import { CONTRACT_ADDRESS, CONTRACT_ABI, WRITE_FUNC, READ_FUNC, EXPLORER_BASE_URL } from '../services/contractConfig'
import { ContractPromise } from '@polkadot/api-contract';
import { web3Accounts, web3Enable, web3FromAddress } from '@polkadot/extension-dapp';
import { CONTRACT_METADATA } from '../services/contractConfig';
import { makeGasLimit, pickMessage } from '../services/contractsCompat';

export function TestPage() {
  // Placeholder states; will be wired to real chain later
  const [connected, setConnected] = React.useState(false)
  const [network, setNetwork] = React.useState('Unknown') // Chinese: 链名 / English: chain name
  const [genesis, setGenesis] = React.useState('') // Chinese: Genesis Hash / English: genesis hash
  const [hasContracts, setHasContracts] = React.useState(false) // Chinese: 是否支持 pallet-contracts / English: support of pallet-contracts
  const [contract, setContract] = React.useState(CONTRACT_ADDRESS || '0x...')
  const [txHash, setTxHash] = React.useState('')
  const [readValue, setReadValue] = React.useState('')
  const [account, setAccount] = React.useState(null);

  // 检测网络连接状态（读取链名/Genesis，并检测 pallet-contracts）
  // English: Detect chain name/genesis and check pallet-contracts availability
  React.useEffect(() => {
    const detectNetwork = async () => {
      try {
        const api = await getApi()
        const chainName = (await api.rpc.system.chain()).toString()
        const chainId = api.genesisHash.toHex()
        const supportsContracts = !!(api.tx && api.tx.contracts && api.query && api.query.contracts)
        setNetwork(chainName)
        setGenesis(chainId)
        setHasContracts(supportsContracts)
      } catch (error) {
        console.error('网络检测错误 / Network detection error:', error)
        setNetwork('连接失败 / Connection failed')
      }
    }
    detectNetwork()
  }, [])

  // Wallet connection
  const connectWallet = async () => {
    await web3Enable('ParaGoal');
    const allAccounts = await web3Accounts();
    if (allAccounts.length > 0) {
      setAccount(allAccounts[0]);
      setConnected(true);
    } else {
      alert('No accounts found. Please install Polkadot.js extension.');
    }
  };

  // 将 PAS 金额（字符串）转换为 Balance（10 位小数）
  // English: Convert PAS amount string to Balance with 10 decimals
  function toBalance(api, amountStr) {
    const decimals = 10n;
    const base = 10n ** decimals;
    const [intPart, fracPart = ''] = String(amountStr || '0').split('.')
    const intValue = BigInt(intPart || '0')
    const fracDigits = BigInt((fracPart || '').slice(0, Number(decimals)).padEnd(Number(decimals), '0'))
    const total = intValue * base + fracDigits
    return api.registry.createType('Balance', total.toString())
  }

  // Real contract interaction (inject_pool + get_match)
  async function handleWriteAction() {
    if (!account) {
      alert('Please connect wallet first');
      return;
    }

    try {
      const api = await getApi();
      const contract = new ContractPromise(api, CONTRACT_METADATA, CONTRACT_ADDRESS);

      const matchId = 1; // Chinese: 示例比赛ID，可在 UI 中改为动态 / English: example match id
      const gasLimit = makeGasLimit(api, { refTime: 5_000_000_000, proofSize: 131_072, legacyWeight: 7_000_000_000 });
      const value = toBalance(api, '1'); // Chinese: 1 PAS（10 位小数）/ English: 1 PAS

      const injector = await web3FromAddress(account.address);

      // Call inject_pool (payable) with snake/camel case compatibility
      const qInjectPool = pickMessage(contract.query, 'inject_pool', 'injectPool')
      const tInjectPool = pickMessage(contract.tx, 'inject_pool', 'injectPool')
      if (!qInjectPool || !tInjectPool) throw new Error('inject_pool message not found in ABI')
      const { gasRequired, result } = await qInjectPool(account.address, { value, gasLimit }, matchId);

      if (result.isOk) {
        await tInjectPool({ gasLimit: gasRequired, value }, matchId).signAndSend(account.address, { signer: injector.signer }, (status) => {
          if (status.isInBlock) {
            setTxHash(status.asInBlock.toHex());
            alert('Transaction successful!');
          }
        });
      } else {
        throw new Error('Query failed');
      }

      // Read example: get_match
      const qGetMatch = pickMessage(contract.query, 'get_match', 'getMatch')
      if (!qGetMatch) throw new Error('get_match message not found in ABI')
      const readResult = await qGetMatch(account.address, { gasLimit }, matchId);
      setReadValue(JSON.stringify(readResult.output.toHuman()));

    } catch (error) {
      console.error('Error:', error);
      alert('Error: ' + error.message);
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
            <div className="text-slate-200 font-medium">{network}</div>
          </div>
          <div className="space-y-1">
            <div className="text-slate-400 text-sm">Genesis</div>
            <div className="text-slate-200 font-mono break-all">{genesis || 'N/A'}</div>
          </div>
          <div className="space-y-1">
            <div className="text-slate-400 text-sm">pallet-contracts</div>
            <div className="text-slate-200 font-medium">{hasContracts ? 'Available' : 'Unavailable'}</div>
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
          <button onClick={connectWallet} className="bg-blue-500 text-white px-4 py-2 rounded">
            Connect Wallet
          </button>
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


