// 对战页面骨架（中英文注释）
// Chinese: 展示对战双方、下注入口占位、AI 分析占位，支持用户创建的比赛。
// English: Shows teams, stake placeholders, and AI analysis placeholder, supports user-created matches.
import React from 'react'
import { useParams, Link } from 'react-router-dom'
import { BUILT_IN_MATCHES } from '../shared/builtinMatches'
import { TeamCard } from '../sections/TeamCard'
import { AiCommentary } from '../sections/AiCommentary'
import { MatchStats } from '../sections/MatchStats'
import { BetPanel } from '../sections/BetPanel'
import { loadMatchesFromIPFS } from '../services/ipfsStorage'
import { useWallet } from '../contexts/WalletContext'

export function MatchPage() {
  const { id } = useParams()
  const { address, isConnected } = useWallet()
  const [userMatches, setUserMatches] = React.useState([])
  const [isLoading, setIsLoading] = React.useState(false)

  // Load user-created matches from localStorage
  // 从本地存储加载用户创建的比赛
  React.useEffect(() => {
    console.log('Address changed in MatchPage:', address);
    if (address && isConnected) {
      loadUserMatches()
    }
  }, [address, isConnected])

  const loadUserMatches = async () => {
    setIsLoading(true)
    try {
      const result = await loadMatchesFromIPFS()
      if (result.success) {
        setUserMatches(result.matches)
      }
    } catch (error) {
      console.log('No user matches found')
    } finally {
      setIsLoading(false)
    }
  }

  // Find match in both built-in and user-created matches
  // 在内置比赛和用户创建的比赛中查找比赛
  const match = React.useMemo(() => {
    // First check built-in matches
    // 首先检查内置比赛
    let foundMatch = BUILT_IN_MATCHES.find(m => String(m.id) === String(id))
    
    // If not found, check user-created matches
    // 如果没找到，检查用户创建的比赛
    if (!foundMatch) {
      foundMatch = userMatches.find(m => String(m.id) === String(id))
    }
    
    return foundMatch
  }, [id, userMatches])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Match Detail</h1>
        <Link to="/" className="text-sm text-blue-600 hover:underline">Back to Home</Link>
      </div>

      {isLoading ? (
        <div className="text-center text-slate-400 py-8">Loading match details...</div>
      ) : match ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
            <TeamCard title={match.teamA} />
            <div className="text-center py-10 select-none">
              <div className="text-3xl font-extrabold text-yellow-400">VS</div>
              <div className="text-xs text-slate-500 mt-1">Combat Power</div>
            </div>
            <TeamCard title={match.teamB} />
          </div>
          <AiCommentary />
          <MatchStats />
          <BetPanel teamA={match.teamA} teamB={match.teamB} matchId={match.id} />
          
          {/* Show match source info */}
          {/* 显示比赛来源信息 */}
          <div className="text-xs text-slate-500 text-center">
            {String(match.id).startsWith('local-') ? 'User Created Match' : 'Built-in Match'}
          </div>
        </div>
      ) : (
        <div className="text-sm text-gray-500">Match not found.</div>
      )}
    </div>
  )
}


