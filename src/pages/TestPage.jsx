// /test page for hackathon prototype
// English: Minimal test page for judges to verify the core on-chain action (UI placeholders for now).
import React from 'react'
import { GlowCard } from '../components/GlowCard'
import { getApi } from '../services/web3Client'
import { CONTRACT_ADDRESS, CONTRACT_ABI, WRITE_FUNC, READ_FUNC, EXPLORER_BASE_URL } from '../services/contractConfig'
import { ContractPromise } from '@polkadot/api-contract';
import { web3Accounts, web3Enable, web3FromAddress } from '@polkadot/extension-dapp';
import { CONTRACT_METADATA } from '../services/contractConfig';

export function TestPage() {
  // Placeholder states; will be wired to real chain later
  const [connected, setConnected] = React.useState(false)
  const [network, setNetwork] = React.useState('Unknown')
  const [contract, setContract] = React.useState(CONTRACT_ADDRESS || '0x...')
  const [txHash, setTxHash] = React.useState('')
  const [readValue, setReadValue] = React.useState('')
  const [account, setAccount] = React.useState(null);

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

  // Real contract interaction
  async function handleWriteAction() {
    if (!account) {
      alert('Please connect wallet first');
      return;
    }

    try {
      const api = await getApi();
      const contract = new ContractPromise(api, CONTRACT_METADATA, CONTRACT_ADDRESS);

      const matchId = 1; // Example match ID
      const gasLimit = api.registry.createType('WeightV2', {
        refTime: 5000000000,
        proofSize: 131072,
      });
      const value = api.registry.createType('Balance', '1000000000000'); // 1 unit, adjust as needed (PAS has 10 decimals)

      const injector = await web3FromAddress(account.address);

      // Call inject_pool (payable)
      const { gasRequired, result } = await contract.query.injectPool(
        account.address,
        { value, gasLimit },
        matchId
      );

      if (result.isOk) {
        await contract.tx.injectPool({ gasLimit: gasRequired, value }, matchId).signAndSend(account.address, { signer: injector.signer }, (status) => {
          if (status.isInBlock) {
            setTxHash(status.asInBlock.toHex());
            alert('Transaction successful!');
          }
        });
      } else {
        throw new Error('Query failed');
      }

      // Read example: get_match
      const readResult = await contract.query.getMatch(account.address, { gasLimit }, matchId);
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


