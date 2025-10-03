// GlowCard 发光卡片容器（中英文注释）
// Chinese: 统一卡片样式与霓虹发光阴影，支持自定义类名与内容。
// English: Neon-glow card container with reusable styles.
import React from 'react'

export function GlowCard({ className = '', children }) {
  return (
    <div
      className={
        `rounded-xl border border-slate-700/60 bg-slate-900/60 shadow-glow ${className}`
      }
    >
      {children}
    </div>
  )
}


