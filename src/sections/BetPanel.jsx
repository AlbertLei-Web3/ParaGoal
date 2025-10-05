// BetPanel (User Bets and Admin Controls)
// English: Placeholder actions. No on-chain tx yet.
// English: Placeholder actions for user bet and admin controls. No on-chain tx.
import React, { useState } from 'react'
import { GlowCard } from '../components/GlowCard'
import { getApi } from '../services/web3Client';
import { CONTRACT_ADDRESS, CONTRACT_METADATA } from '../services/contractConfig';
import { ContractPromise } from '@polkadot/api-contract';
import { web3FromAddress } from '@polkadot/extension-dapp';
import { useWallet } from '../contexts/WalletContext';

export function BetPanel({ teamA = 'Team A', teamB = 'Team B', matchId }) {
  const { address, isConnected } = useWallet();
  const [amount, setAmount] = useState('1'); // Default to 1 unit for debugging

  const handleAddRewardPool = async () => {
    if (!isConnected || !address) {
      alert('Please connect wallet first');
      return;
    }

    try {
      const api = await getApi();
      const contract = new ContractPromise(api, CONTRACT_METADATA, CONTRACT_ADDRESS);
      const injector = await web3FromAddress(address);
      const value = api.registry.createType('Balance', amount * 10**10); // Assuming 10 decimals for PAS

      // Dry run
      const { gasRequired } = await contract.query.inject_pool(
        address,
        { value, gasLimit: api.registry.createType('WeightV2', { refTime: 1000000000, proofSize: 100000 }) },
        matchId
      );

      // Send tx
      await contract.tx.inject_pool(
        { gasLimit: gasRequired, value },
        matchId
      ).signAndSend(address, { signer: injector.signer }, (status) => {
        if (status.isInBlock) {
          alert('Reward pool added successfully!');
        }
      });
    } catch (error) {
      console.error('Error adding reward pool:', error);
      alert('Error: ' + error.message);
    }
  };

  return (
    <GlowCard className="p-6">
      {/* Title */}
      <div className="flex items-center gap-2 text-slate-200 font-semibold mb-4">
        <span className="text-pink-400">🎯</span>
        <span>Place Your Bet</span>
      </div>

      {/* User bet actions (placeholder) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button
          className="rounded-lg px-4 py-6 text-left bg-blue-600 hover:bg-blue-700 text-white shadow-glow"
          title="Placeholder: bet on team A (no chain)"
        >
          <div className="text-lg font-bold">Bet on</div>
          <div className="opacity-90 text-sm">Bet on {teamA}</div>
        </button>
        <button
          className="rounded-lg px-4 py-6 text-left bg-amber-500 hover:bg-amber-600 text-white shadow-glow"
          title="Placeholder: bet on team B (no chain)"
        >
          <div className="text-lg font-bold">Bet on</div>
          <div className="opacity-90 text-sm">Bet on {teamB}</div>
        </button>
      </div>

      {/* Admin controls (placeholder) */}
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
          <button className="rounded-md px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white" title="Placeholder: announce result (no chain)">Announce Result</button>
          <button className="rounded-md px-4 py-3 bg-rose-600 hover:bg-rose-700 text-white" title="Placeholder: reset match (no chain)">Reset Match</button>
        </div>
      </div>
    </GlowCard>
  )
}


