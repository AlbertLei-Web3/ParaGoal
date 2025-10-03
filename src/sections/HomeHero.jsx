// 首页头部横幅（Hero）- 中英文注释
// Chinese: 突出平台名称与口号，符合深色主题样式。
// English: Emphasizes platform title and tagline in a dark theme.
import React from 'react'

export function HomeHero() {
  return (
    <section className="text-center space-y-4">
      <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight">
        FanForce AI - Win-Win Prediction Platform
      </h1>
      <p className="text-slate-400">
        Revolutionary non-zero-sum design ensures all participants earn rewards from their predictions
      </p>
    </section>
  )
}


