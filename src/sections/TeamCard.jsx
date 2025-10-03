// TeamCard（球队信息卡）中英文注释
// Chinese: 展示队名、占位评分、三维度占位（历史胜率/平均年龄/伤病）。不包含任何虚构数值。
// English: Shows team name, placeholder score, and three metric placeholders. No fake numbers.
import React from 'react'
import { GlowCard } from '../components/GlowCard'
import { FaFlag } from 'react-icons/fa'

export function TeamCard({ title }) {
  return (
    <GlowCard className="p-6">
      <div className="flex items-center gap-3">
        <div className="h-8 w-12 rounded bg-slate-800/80 flex items-center justify-center">
          <FaFlag className="text-slate-300" />
        </div>
        <div className="text-xl font-semibold text-slate-100">{title}</div>
      </div>

      <div className="mt-4 text-5xl font-extrabold text-yellow-400 tabular-nums select-none">--</div>

      <div className="mt-4 space-y-1 text-xs text-slate-400">
        <div>Historical Win Rate: --</div>
        <div>Average Age: --</div>
        <div>Injury Count: --</div>
        <div>Core Player: --</div>
      </div>
    </GlowCard>
  )
}


