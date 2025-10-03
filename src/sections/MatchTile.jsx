// 比赛卡片样式（中英文注释）
// Chinese: 深色卡片，显示 TeamA VS TeamB，并提供跳转。
// English: Dark tile showing TeamA vs TeamB with navigation.
import React from 'react'
import { Link } from 'react-router-dom'
import { FaFutbol } from 'react-icons/fa'
import { GlowCard } from '../components/GlowCard'

export function MatchTile({ id, teamA, teamB }) {
  return (
    <GlowCard className="group hover:shadow-glow transition">
      <Link to={`/match/${id}`} className="block p-4">
        <div className="flex items-center justify-between">
          <div className="flex-1 flex items-center gap-2">
            <FaFutbol className="text-green-400 opacity-80 group-hover:scale-110 transition" />
            <div className="text-slate-200 font-medium">{teamA}</div>
          </div>
          <div className="px-3 text-slate-400">VS</div>
          <div className="flex-1 text-right flex items-center justify-end gap-2">
            <div className="text-slate-200 font-medium">{teamB}</div>
            <FaFutbol className="text-red-400 opacity-80 group-hover:scale-110 transition" />
          </div>
        </div>
        <div className="mt-2 text-xs text-slate-500">Classic Matchup</div>
      </Link>
    </GlowCard>
  )
}


