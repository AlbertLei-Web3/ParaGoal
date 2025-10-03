// 首页页面骨架（中英文注释）
// Chinese: 展示四场固定比赛卡片与占位说明，不依赖真实链上数据。
// English: Renders four built-in match cards and placeholders, no on-chain data.
import React from 'react'
import { Link } from 'react-router-dom'
import { BUILT_IN_MATCHES } from '../shared/builtinMatches'

export function HomePage() {
  return (
    <div className="space-y-6">
      <section className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">今日对战</h1>
        <p className="text-sm text-gray-500">连接钱包后可下注与管理</p>
      </section>

      <section className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {BUILT_IN_MATCHES.map((m) => (
          <Link key={m.id} to={`/match/${m.id}`} className="block border bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition">
            <div className="text-sm text-gray-500 mb-2">固定比赛</div>
            <div className="text-lg font-medium">{m.teamA} vs {m.teamB}</div>
          </Link>
        ))}
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-2">更多比赛</h2>
        <div className="text-sm text-gray-500">后续通过 Admin 创建并从链上读取。</div>
      </section>
    </div>
  )
}


