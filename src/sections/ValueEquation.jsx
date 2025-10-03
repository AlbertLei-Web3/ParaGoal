// 价值等式板块（Win 70% + Lose 30% = Everyone Profits）
// Chinese: 使用深色卡片强调规则，纯样式不含数据。
// English: Dark card showing value equation, style-only.
import React from 'react'

export function ValueEquation() {
  return (
    <section className="flex justify-center">
      <div className="w-full max-w-4xl rounded-xl border border-slate-700/60 bg-slate-900/60 backdrop-blur p-6">
        <div className="grid grid-cols-3 items-center text-center text-slate-200">
          <div className="space-y-1">
            <div className="text-xl font-bold">Win</div>
            <div className="text-xs text-slate-400">70% of Pool</div>
          </div>
          <div className="space-y-1">
            <div className="text-xl font-bold">Lose</div>
            <div className="text-xs text-slate-400">30% of Pool</div>
          </div>
          <div className="space-y-1">
            <div className="text-xl font-bold">= Everyone Profits</div>
            <div className="text-xs text-slate-400">AI-Powered Non-Zero-Sum Betting</div>
          </div>
        </div>
      </div>
    </section>
  )
}


