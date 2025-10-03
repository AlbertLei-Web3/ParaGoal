// 足球场背景组件（中英文注释）
// Chinese: 提供带网格与渐变的背景层，增强体育竞技氛围。
// English: Grid + gradient background layer for sporty ambiance.
import React from 'react'

export function PitchBackground() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
      <div className="absolute inset-0 bg-pitch-gradient" />
      <div className="absolute inset-0 bg-pitch-grid bg-grid-sm opacity-[0.25]" />
      <div className="absolute inset-x-0 top-[-10%] h-[300px] blur-3xl opacity-40" style={{
        background: 'radial-gradient(600px 200px at 50% 0%, rgba(56,189,248,0.25), transparent 70%)'
      }} />
    </div>
  )
}


