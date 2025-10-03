// BetPanel（下注与管理员操作面板）
// Chinese: 提供用户下注与 Admin 操作的按钮占位，未接入链，点击不产生真实交易。
// English: Placeholder actions for user bet and admin controls. No on-chain tx.
import React from 'react'
import { GlowCard } from '../components/GlowCard'

export function BetPanel({ teamA = 'Team A', teamB = 'Team B' }) {
  return (
    <GlowCard className="p-6">
      {/* 标题 / Title */}
      <div className="flex items-center gap-2 text-slate-200 font-semibold mb-4">
        <span className="text-pink-400">🎯</span>
        <span>Place Your Bet</span>
      </div>

      {/* 用户下注按钮（占位） / User bet actions (placeholder) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button
          className="rounded-lg px-4 py-6 text-left bg-blue-600 hover:bg-blue-700 text-white shadow-glow"
          title="占位：下注 {teamA}（未接链）"
        >
          <div className="text-lg font-bold">Bet on</div>
          <div className="opacity-90 text-sm">Bet on {teamA}</div>
        </button>
        <button
          className="rounded-lg px-4 py-6 text-left bg-amber-500 hover:bg-amber-600 text-white shadow-glow"
          title="占位：下注 {teamB}（未接链）"
        >
          <div className="text-lg font-bold">Bet on</div>
          <div className="opacity-90 text-sm">Bet on {teamB}</div>
        </button>
      </div>

      {/* 管理员操作（占位） / Admin controls (placeholder) */}
      <div className="mt-6">
        <div className="text-center text-slate-400 text-sm mb-3">Admin Controls</div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <button className="rounded-md px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white" title="占位：注入奖池（未接链）">Add Reward Pool</button>
          <button className="rounded-md px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white" title="占位：公布结果（未接链）">Announce Result</button>
          <button className="rounded-md px-4 py-3 bg-rose-600 hover:bg-rose-700 text-white" title="占位：重置比赛（未接链）">Reset Match</button>
        </div>
      </div>
    </GlowCard>
  )
}


