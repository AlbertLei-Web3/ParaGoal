// 对战页面骨架（中英文注释）
// Chinese: 展示对战双方、下注入口占位、AI 分析占位。
// English: Shows teams, stake placeholders, and AI analysis placeholder.
import React from 'react'
import { useParams, Link } from 'react-router-dom'
import { BUILT_IN_MATCHES } from '../shared/builtinMatches'

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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 border bg-white rounded-lg p-4 shadow-sm">
            <div className="text-gray-500 text-sm mb-2">固定比赛（示意）</div>
            <div className="text-xl font-medium">{match.teamA} vs {match.teamB}</div>
          </div>
          <div className="border bg-white rounded-lg p-4 shadow-sm space-y-3">
            <div className="font-semibold">下注入口（占位）</div>
            <div className="text-sm text-gray-500">连接钱包并选择队伍与金额。</div>
            <button className="w-full py-2 rounded bg-gray-200 text-gray-600 cursor-not-allowed">确认下注（未接链）</button>
            <button className="w-full py-2 rounded bg-white border hover:bg-gray-50">模拟分析（静态文案）</button>
          </div>
        </div>
      ) : (
        <div className="text-sm text-gray-500">未找到该比赛。</div>
      )}
    </div>
  )
}


