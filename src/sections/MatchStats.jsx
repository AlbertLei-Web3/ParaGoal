// MatchStats（比赛统计占位）
// Chinese: 显示 TeamA/奖池/TeamB 三栏占位，无真实数值。
// English: Three stat boxes (TeamA / Pool / TeamB) placeholders.
import React from 'react'
import { GlowCard } from '../components/GlowCard'

export function MatchStats() {
  return (
    <GlowCard className="p-4">
      <div className="text-slate-200 font-semibold mb-3">Match Statistics</div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="rounded-lg border border-slate-700/60 bg-slate-900/60 p-4 text-center">
          <div className="text-slate-400 text-sm mb-1">Team A Bets</div>
          <div className="text-yellow-400 font-bold">0.0 PAS</div>
        </div>
        <div className="rounded-lg border border-slate-700/60 bg-slate-900/60 p-4 text-center">
          <div className="text-slate-400 text-sm mb-1">Reward Pool</div>
          <div className="text-yellow-400 font-bold">0.0 PAS</div>
        </div>
        <div className="rounded-lg border border-slate-700/60 bg-slate-900/60 p-4 text-center">
          <div className="text-slate-400 text-sm mb-1">Team B Bets</div>
          <div className="text-yellow-400 font-bold">0.0 PAS</div>
        </div>
      </div>
    </GlowCard>
  )
}


