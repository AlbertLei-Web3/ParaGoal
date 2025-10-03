// 比赛卡片样式（中英文注释）
// Chinese: 深色卡片，显示 TeamA VS TeamB，并提供跳转。
// English: Dark tile showing TeamA vs TeamB with navigation.
import React from 'react'
import { Link } from 'react-router-dom'

export function MatchTile({ id, teamA, teamB }) {
  return (
    <Link to={`/match/${id}`} className="block group rounded-xl border border-slate-700/60 bg-slate-900/60 p-4 hover:bg-slate-900 transition">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="text-slate-200 font-medium">{teamA}</div>
        </div>
        <div className="px-3 text-slate-400">VS</div>
        <div className="flex-1 text-right">
          <div className="text-slate-200 font-medium">{teamB}</div>
        </div>
      </div>
      <div className="mt-2 text-xs text-slate-500">Classic Matchup</div>
    </Link>
  )
}


