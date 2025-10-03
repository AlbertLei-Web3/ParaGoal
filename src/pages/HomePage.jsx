// 首页页面骨架（中英文注释）
// Chinese: 展示四场固定比赛卡片与占位说明，不依赖真实链上数据。
// English: Renders four built-in match cards and placeholders, no on-chain data.
import React from 'react'
import { Link } from 'react-router-dom'
import { BUILT_IN_MATCHES } from '../shared/builtinMatches'
import { HomeHero } from '../sections/HomeHero'
import { ValueEquation } from '../sections/ValueEquation'
import { MatchTile } from '../sections/MatchTile'

export function HomePage() {
  return (
    <div className="space-y-10">
      <HomeHero />
      <ValueEquation />

      <section className="space-y-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <span>🔥 Classic Matchups</span>
        </h2>
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
          {BUILT_IN_MATCHES.map((m) => (
            <MatchTile key={m.id} id={m.id} teamA={m.teamA} teamB={m.teamB} />
          ))}
        </div>
      </section>

      <section className="pt-4">
        <h3 className="text-lg font-semibold mb-2">Select Teams to Compare</h3>
        <p className="text-sm text-slate-400">后续将从链上与 Admin 创建中读取队伍，当前仅为样式占位。</p>
      </section>
    </div>
  )
}


