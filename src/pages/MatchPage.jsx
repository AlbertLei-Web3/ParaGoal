// 对战页面骨架（中英文注释）
// Chinese: 展示对战双方、下注入口占位、AI 分析占位。
// English: Shows teams, stake placeholders, and AI analysis placeholder.
import React from 'react'
import { useParams, Link } from 'react-router-dom'
import { BUILT_IN_MATCHES } from '../shared/builtinMatches'
import { TeamCard } from '../sections/TeamCard'
import { AiCommentary } from '../sections/AiCommentary'
import { MatchStats } from '../sections/MatchStats'

export function MatchPage() {
  const { id } = useParams()
  const match = BUILT_IN_MATCHES.find(m => String(m.id) === String(id))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">对战详情</h1>
        <Link to="/" className="text-sm text-blue-600 hover:underline">返回首页</Link>
      </div>

      {match ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
            <TeamCard title={match.teamA} />
            <div className="text-center py-10 select-none">
              <div className="text-3xl font-extrabold text-yellow-400">VS</div>
              <div className="text-xs text-slate-500 mt-1">Combat Power</div>
            </div>
            <TeamCard title={match.teamB} />
          </div>
          <AiCommentary />
          <MatchStats />
        </div>
      ) : (
        <div className="text-sm text-gray-500">未找到该比赛。</div>
      )}
    </div>
  )
}


