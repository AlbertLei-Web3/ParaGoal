// AiCommentary（AI 战术解读占位）
// Chinese: 用发光卡展示说明文字与操作按钮，无真实AI。
// English: Glowing card with description and CTA, no real AI.
import React from 'react'
import { GlowCard } from '../components/GlowCard'
import { FaBrain, FaMagic } from 'react-icons/fa'

export function AiCommentary() {
  return (
    <GlowCard className="p-6">
      <div className="font-semibold mb-4 flex items-center gap-2 text-slate-200">
        <FaMagic className="text-pink-400" /> AI Tactical Analyst Commentary
      </div>
      <div className="flex flex-col items-center text-center text-slate-400 space-y-4">
        <FaBrain className="text-pink-400 text-5xl" />
        <p>Ready to generate expert tactical analysis based on real team data</p>
        <button className="px-4 py-2 rounded bg-gradient-to-r from-pink-500 to-yellow-500 text-white shadow-glow">
          Start AI Analysis ✨
        </button>
      </div>
    </GlowCard>
  )
}


