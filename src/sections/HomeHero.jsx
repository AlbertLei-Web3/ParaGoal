// 首页头部横幅（Hero）- 中英文注释
// Chinese: 突出平台名称与口号，符合深色主题样式。
// English: Emphasizes platform title and tagline in a dark theme.
import React from 'react'
import { motion } from 'framer-motion'
import { FaTrophy } from 'react-icons/fa'

export function HomeHero() {
  return (
    <section className="text-center space-y-4">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="flex items-center justify-center gap-3">
        <FaTrophy className="text-yellow-400 text-3xl" />
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight">
          FanForce AI - Win-Win Prediction Platform
        </h1>
      </motion.div>
      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2, duration: 0.5 }} className="text-slate-400">
        Revolutionary non-zero-sum design ensures all participants earn rewards from their predictions
      </motion.p>
    </section>
  )
}


