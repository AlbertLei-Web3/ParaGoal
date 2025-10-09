// BetPanel (User Bets and Admin Controls)
// Chinese: 与链上 Ink! 合约进行真实交互的下注与管理面板。
// English: Betting and admin panel wired to real on-chain Ink! contract.
import React, { useState } from 'react'
import { GlowCard } from '../components/GlowCard'
import { getApi } from '../services/web3Client';
import { CONTRACT_ADDRESS, CONTRACT_METADATA } from '../services/contractConfig';
import { ContractPromise } from '@polkadot/api-contract';
import { web3FromAddress } from '@polkadot/extension-dapp';
import { useWallet } from '../contexts/WalletContext';

export function BetPanel({ teamA = 'Team A', teamB = 'Team B', matchId }) {
  const { address, isConnected } = useWallet();
  const [amount, setAmount] = useState('1'); // Chinese: 下注/注入金额（以 PAS 为单位，10 位小数）/ English: Amount in PAS (10 decimals)
  const [chainMatchId, setChainMatchId] = useState(null); // Chinese: 实际链上 matchId / English: on-chain match id
  const [loading, setLoading] = useState(false);
  const [matchInfo, setMatchInfo] = useState(null); // Chinese: 合约返回的比赛详情 / English: match detail from contract

  // Chinese: 将字符串编码为 bytes32（UTF-8，超过截断，未满右侧补 0）
  // English: Encode a string into bytes32 (UTF-8, truncate if too long, right-pad zeros)
  function stringToBytes32(name) {
    const encoder = new TextEncoder();
    const bytes = encoder.encode(name);
    const arr = new Uint8Array(32);
    arr.fill(0);
    arr.set(bytes.slice(0, 32));
    return arr;
  }

  // Chinese: 将 PAS 金额（字符串）转换为 Balance（10 位小数）
  // English: Convert PAS amount (string) to Balance with 10 decimals
  function toBalance(api, amountStr) {
    const decimals = 10n;
    const base = 10n ** decimals;
    // 支持小数：例如 "1.23" -> 1*10^10 + 23*10^(10-2)
    const [intPart, fracPart = ''] = String(amountStr || '0').split('.');
    const intValue = BigInt(intPart || '0');
    const fracDigits = BigInt((fracPart || '').slice(0, Number(decimals)).padEnd(Number(decimals), '0'));
    const total = intValue * base + fracDigits;
    return api.registry.createType('Balance', total.toString());
  }

  // Chinese: 解析合约 Option 返回 / English: Helper for ink! Option
  function isSome(optionLike) {
    // ContractPromise query output often returns .toHuman()/toJSON; we try to detect presence
    if (!optionLike) return false;
    if (optionLike.isSome !== undefined) return optionLike.isSome; // scale info
    const h = optionLike.toHuman ? optionLike.toHuman() : optionLike;
    if (h && typeof h === 'object' && 'Some' in h) return true;
    return false;
  }

  // Chinese: 从本地映射获取链上 matchId；若是纯数字，直接使用；若是 local- 前缀，则查表
  // English: Resolve chain match id from mapping or direct numeric id
  function resolveChainMatchId() {
    const raw = String(matchId);
    if (/^\d+$/.test(raw)) return Number(raw);
    const mapRaw = localStorage.getItem('paragoal_match_chain_map') || '{}';
    try {
      const map = JSON.parse(mapRaw);
      return map[raw] || null;
    } catch {
      return null;
    }
  }

  // Chinese: 保存本地-链上 matchId 映射 / English: Persist mapping from local id to chain id
  function persistChainMapping(localId, chainId) {
    const mapRaw = localStorage.getItem('paragoal_match_chain_map') || '{}';
    let map;
    try { map = JSON.parse(mapRaw) } catch { map = {} }
    map[String(localId)] = Number(chainId);
    localStorage.setItem('paragoal_match_chain_map', JSON.stringify(map));
  }

  // Chinese: 首次渲染时解析链上 matchId，并尝试读取比赛信息 / English: On mount, resolve id and fetch match
  React.useEffect(() => {
    const id = resolveChainMatchId();
    setChainMatchId(id);
    if (id != null) {
      refreshMatchInfo(id);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matchId]);

  // Chinese: 刷新比赛详情（调用 get_match）/ English: Refresh on-chain match info
  async function refreshMatchInfo(id = chainMatchId) {
    if (id == null) return;
    try {
      const api = await getApi();
      const contract = new ContractPromise(api, CONTRACT_METADATA, CONTRACT_ADDRESS);
      const gasLimit = api.registry.createType('WeightV2', { refTime: 2_000_000_000, proofSize: 200_000 });
      const q = await contract.query.get_match(address || contract.address, { gasLimit }, id);
      // 使用 toHuman() 便于展示 / Prefer human for display
      const human = q.output?.toHuman?.();
      setMatchInfo(human || q.output);
    } catch (error) {
      console.error('读取比赛信息失败 / Failed to fetch match:', error);
    }
  }

  // Chinese: 注入奖池 / English: Inject reward pool
  const handleAddRewardPool = async () => {
    if (!isConnected || !address) {
      alert('Please connect wallet first');
      return;
    }

    try {
      const api = await getApi();
      const contract = new ContractPromise(api, CONTRACT_METADATA, CONTRACT_ADDRESS);
      const injector = await web3FromAddress(address);
      const value = toBalance(api, amount); // Chinese: 金额精度 10 位 / English: 10 decimals
      const id = chainMatchId;
      if (id == null) {
        alert('该比赛尚未同步到链上，请先点击 "Sync to Chain"。\nMatch not on-chain yet. Please "Sync to Chain" first.');
        return;
      }

      // Dry run
      const { gasRequired, result: dryResult } = await contract.query.inject_pool(
        address,
        { value, gasLimit: api.registry.createType('WeightV2', { refTime: 2_500_000_000, proofSize: 250_000 }) },
        id
      );
      if (dryResult.isErr) throw new Error('Query failed');

      // Send tx
      await contract.tx.inject_pool(
        { gasLimit: gasRequired, value },
        id
      ).signAndSend(address, { signer: injector.signer }, (res) => {
        if (res.status?.isInBlock) {
          alert('Reward pool added successfully!');
          refreshMatchInfo(id);
        }
      });
    } catch (error) {
      console.error('Error adding reward pool:', error);
      alert('Error: ' + error.message);
    }
  };

  // Chinese: 下注（team: 0=TeamA, 1=TeamB）/ English: Place stake
  async function handleStake(teamIndex) {
    if (!isConnected || !address) {
      alert('Please connect wallet first');
      return;
    }
    try {
      const api = await getApi();
      const contract = new ContractPromise(api, CONTRACT_METADATA, CONTRACT_ADDRESS);
      const injector = await web3FromAddress(address);
      const value = toBalance(api, amount);
      const id = chainMatchId;
      if (id == null) {
        alert('该比赛尚未同步到链上，请先点击 "Sync to Chain"。\nMatch not on-chain yet. Please "Sync to Chain" first.');
        return;
      }
      const gasLimit = api.registry.createType('WeightV2', { refTime: 2_500_000_000, proofSize: 250_000 });
      const { gasRequired, result: dryResult } = await contract.query.stake(address, { value, gasLimit }, id, teamIndex);
      if (dryResult.isErr) throw new Error('Query failed');
      await contract.tx.stake({ gasLimit: gasRequired, value }, id, teamIndex)
        .signAndSend(address, { signer: injector.signer }, (res) => {
          if (res.status?.isInBlock) {
            alert('Stake placed successfully!');
            refreshMatchInfo(id);
          }
        });
    } catch (error) {
      console.error('Stake error:', error);
      alert('Error: ' + (error?.message || String(error)));
    }
  }

  // Chinese: 开盘 / English: Open match (admin only)
  async function handleOpen() {
    if (!isConnected || !address) { alert('Connect wallet first'); return; }
    try {
      const api = await getApi();
      const contract = new ContractPromise(api, CONTRACT_METADATA, CONTRACT_ADDRESS);
      const injector = await web3FromAddress(address);
      const id = chainMatchId; if (id == null) { alert('Sync to chain first'); return; }
      const gasLimit = api.registry.createType('WeightV2', { refTime: 2_000_000_000, proofSize: 200_000 });
      const { gasRequired, result } = await contract.query.open_match(address, { gasLimit }, id);
      if (result.isErr) throw new Error('Query failed');
      await contract.tx.open_match({ gasLimit: gasRequired }, id).signAndSend(address, { signer: injector.signer }, (res) => {
        if (res.status?.isInBlock) { alert('Match opened'); refreshMatchInfo(id); }
      });
    } catch (error) { console.error('Open error:', error); alert('Error: ' + error.message); }
  }

  // Chinese: 收盘 / English: Close match (admin only)
  async function handleClose() {
    if (!isConnected || !address) { alert('Connect wallet first'); return; }
    try {
      const api = await getApi();
      const contract = new ContractPromise(api, CONTRACT_METADATA, CONTRACT_ADDRESS);
      const injector = await web3FromAddress(address);
      const id = chainMatchId; if (id == null) { alert('Sync to chain first'); return; }
      const gasLimit = api.registry.createType('WeightV2', { refTime: 2_000_000_000, proofSize: 200_000 });
      const { gasRequired, result } = await contract.query.close_match(address, { gasLimit }, id);
      if (result.isErr) throw new Error('Query failed');
      await contract.tx.close_match({ gasLimit: gasRequired }, id).signAndSend(address, { signer: injector.signer }, (res) => {
        if (res.status?.isInBlock) { alert('Match closed'); refreshMatchInfo(id); }
      });
    } catch (error) { console.error('Close error:', error); alert('Error: ' + error.message); }
  }

  // Chinese: 结算 / English: Settle match (admin only)
  async function handleSettle(resultIndex) {
    if (!isConnected || !address) { alert('Connect wallet first'); return; }
    try {
      const api = await getApi();
      const contract = new ContractPromise(api, CONTRACT_METADATA, CONTRACT_ADDRESS);
      const injector = await web3FromAddress(address);
      const id = chainMatchId; if (id == null) { alert('Sync to chain first'); return; }
      const gasLimit = api.registry.createType('WeightV2', { refTime: 3_000_000_000, proofSize: 300_000 });
      const { gasRequired, result } = await contract.query.settle_match(address, { gasLimit }, id, resultIndex);
      if (result.isErr) throw new Error('Query failed');
      await contract.tx.settle_match({ gasLimit: gasRequired }, id, resultIndex).signAndSend(address, { signer: injector.signer }, (res) => {
        if (res.status?.isInBlock) { alert('Match settled'); refreshMatchInfo(id); }
      });
    } catch (error) { console.error('Settle error:', error); alert('Error: ' + error.message); }
  }

  // Chinese: 领取 / English: Claim payout
  async function handleClaim() {
    if (!isConnected || !address) { alert('Connect wallet first'); return; }
    try {
      const api = await getApi();
      const contract = new ContractPromise(api, CONTRACT_METADATA, CONTRACT_ADDRESS);
      const injector = await web3FromAddress(address);
      const id = chainMatchId; if (id == null) { alert('Sync to chain first'); return; }
      const gasLimit = api.registry.createType('WeightV2', { refTime: 3_000_000_000, proofSize: 300_000 });
      const { gasRequired, result } = await contract.query.claim_payout(address, { gasLimit }, id);
      if (result.isErr) throw new Error('Query failed');
      await contract.tx.claim_payout({ gasLimit: gasRequired }, id).signAndSend(address, { signer: injector.signer }, (res) => {
        if (res.status?.isInBlock) { alert('Payout claimed'); refreshMatchInfo(id); }
      });
    } catch (error) { console.error('Claim error:', error); alert('Error: ' + error.message); }
  }

  // Chinese: 将“本地比赛”上链并保存映射 / English: Sync local match to chain and persist mapping
  async function handleSyncLocalToChain() {
    if (!isConnected || !address) { alert('Connect wallet first'); return; }
    if (!String(matchId).startsWith('local-')) { alert('This match is not a local match.'); return; }
    try {
      setLoading(true);
      const api = await getApi();
      const contract = new ContractPromise(api, CONTRACT_METADATA, CONTRACT_ADDRESS);
      const injector = await web3FromAddress(address);
      const gasLimit = api.registry.createType('WeightV2', { refTime: 3_000_000_000, proofSize: 300_000 });
      const a = stringToBytes32(teamA);
      const b = stringToBytes32(teamB);

      // 预估 gas / English: dry-run for gas
      const { gasRequired, result, output } = await contract.query.create_match(address, { gasLimit }, a, b);
      if (result.isErr) throw new Error('Query failed');

      // 发送交易 / English: send tx
      await contract.tx.create_match({ gasLimit: gasRequired }, a, b)
        .signAndSend(address, { signer: injector.signer }, (res) => {
          if (res.status?.isInBlock) {
            // 小心：返回值获取需要等待事件或 output；这里优先用 dry-run 的 output
            const human = output?.toHuman?.();
            // dry-run 返回 Ok(u128) 包在 Result/Option 中，尝试解析
            let newId = undefined;
            try {
              const j = output?.toJSON?.();
              // toJSON 形如 { ok: "123" } 或 { Ok: 123 }
              newId = j?.ok ?? j?.Ok ?? null;
            } catch {}
            if (newId == null && human) {
              // human 形如 { Ok: '123' }
              newId = human.Ok || human.ok || null;
            }
            if (newId == null) {
              alert('Created on-chain, but failed to read match id. Please refresh later.');
            } else {
              persistChainMapping(matchId, newId);
              setChainMatchId(Number(newId));
              alert(`Match created on-chain with id ${newId}`);
              refreshMatchInfo(Number(newId));
            }
          }
        });
    } catch (error) {
      console.error('Sync local->chain error:', error);
      alert('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <GlowCard className="p-6">
      {/* Title */}
      <div className="flex items-center gap-2 text-slate-200 font-semibold mb-4">
        <span className="text-pink-400">🎯</span>
        <span>Place Your Bet</span>
      </div>

      {/* Chinese: 用户下注操作（真实链上） / English: Real on-chain user actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button
          className="rounded-lg px-4 py-6 text-left bg-blue-600 hover:bg-blue-700 text-white shadow-glow"
          onClick={() => handleStake(0)}
          title="Bet on Team A"
        >
          <div className="text-lg font-bold">Bet on</div>
          <div className="opacity-90 text-sm">Bet on {teamA}</div>
        </button>
        <button
          className="rounded-lg px-4 py-6 text-left bg-amber-500 hover:bg-amber-600 text-white shadow-glow"
          onClick={() => handleStake(1)}
          title="Bet on Team B"
        >
          <div className="text-lg font-bold">Bet on</div>
          <div className="opacity-90 text-sm">Bet on {teamB}</div>
        </button>
      </div>

      {/* Chinese: 管理员操作（需要比赛管理员权限） / English: Admin controls */}
      <div className="mt-6">
        <div className="text-center text-slate-400 text-sm mb-3">Admin Controls</div>
        <div className="mb-3">
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Amount to inject"
            className="w-full p-2 rounded bg-slate-800 text-white"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <button onClick={handleAddRewardPool} className="rounded-md px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white">Add Reward Pool</button>
          <button onClick={handleOpen} className="rounded-md px-4 py-3 bg-sky-600 hover:bg-sky-700 text-white">Open Match</button>
          <button onClick={handleClose} className="rounded-md px-4 py-3 bg-orange-600 hover:bg-orange-700 text-white">Close Match</button>
          <button onClick={() => handleSettle(1)} className="rounded-md px-4 py-3 bg-blue-700 hover:bg-blue-800 text-white">Settle Team A</button>
          <button onClick={() => handleSettle(2)} className="rounded-md px-4 py-3 bg-amber-700 hover:bg-amber-800 text-white">Settle Team B</button>
          <button onClick={() => handleSettle(3)} className="rounded-md px-4 py-3 bg-purple-700 hover:bg-purple-800 text-white">Settle Draw</button>
          <button onClick={handleClaim} className="rounded-md px-4 py-3 bg-rose-600 hover:bg-rose-700 text-white">Claim Payout</button>
          <button onClick={() => refreshMatchInfo()} className="rounded-md px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white">Refresh</button>
          {String(matchId).startsWith('local-') && (
            <button disabled={loading} onClick={handleSyncLocalToChain} className="rounded-md px-4 py-3 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white">
              {loading ? 'Syncing…' : 'Sync Local Match to Chain'}
            </button>
          )}
        </div>
      </div>

      {/* Chinese: 显示链上比赛状态简要信息 / English: Show brief on-chain match info */}
      <div className="mt-6 text-xs text-slate-400">
        <div>On-chain Match Id: <span className="text-slate-200">{chainMatchId ?? 'N/A'}</span></div>
        <div className="mt-1">Match Info (humanized):</div>
        <pre className="mt-1 whitespace-pre-wrap break-all text-slate-300 bg-slate-900/50 p-2 rounded">{matchInfo ? JSON.stringify(matchInfo, null, 2) : 'N/A'}</pre>
      </div>
    </GlowCard>
  )
}


