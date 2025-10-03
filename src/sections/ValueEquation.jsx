// 价值等式板块（Win 70% + Lose 30% = Everyone Profits）
// Chinese: 使用深色卡片强调规则，纯样式不含数据。
// English: Dark card showing value equation, style-only.
import React from 'react'
import { GlowCard } from '../components/GlowCard'
import { FaCoins, FaPlus, FaEquals } from 'react-icons/fa'

export function ValueEquation() {
  return (
    <section className="flex justify-center">
      <GlowCard className="w-full max-w-4xl backdrop-blur p-6">
        <div className="grid grid-cols-3 items-center text-center text-slate-200">
          <div className="space-y-1">
            <div className="flex items-center justify-center gap-2 text-xl font-bold"><FaCoins className="text-yellow-400" /> Win</div>
            <div className="text-xs text-slate-400">70% of Pool</div>
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-center gap-2 text-xl font-bold"><FaPlus className="text-slate-400" /> Lose</div>
            <div className="text-xs text-slate-400">30% of Pool</div>
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-center gap-2 text-xl font-bold"><FaEquals className="text-green-400" /> Everyone Profits</div>
            <div className="text-xs text-slate-400">AI-Powered Non-Zero-Sum Betting</div>
          </div>
        </div>
      </GlowCard>
    </section>
  )
}


