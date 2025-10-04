// 首页页面骨架（中英文注释）
// Chinese: 展示四场固定比赛卡片与用户创建的比赛，支持本地存储数据。
// English: Renders four built-in match cards and user-created matches, supports localStorage data.
import React from 'react'
import { Link } from 'react-router-dom'
import { BUILT_IN_MATCHES } from '../shared/builtinMatches'
import { HomeHero } from '../sections/HomeHero'
import { ValueEquation } from '../sections/ValueEquation'
import { MatchTile } from '../sections/MatchTile'
import { loadMatchesFromIPFS } from '../services/ipfsStorage'
import { useWallet } from '../contexts/WalletContext'

export function HomePage() {
  const { address, isConnected } = useWallet()
  const [userMatches, setUserMatches] = React.useState([])
  const [isLoadingMatches, setIsLoadingMatches] = React.useState(false)
  const [showAllMatches, setShowAllMatches] = React.useState(false)

  // Load user-created matches from localStorage
  // 从本地存储加载用户创建的比赛
  React.useEffect(() => {
    if (address && isConnected) {
      loadUserMatches()
    }
  }, [address, isConnected])

  const loadUserMatches = async () => {
    setIsLoadingMatches(true)
    try {
      const result = await loadMatchesFromIPFS()
      if (result.success) {
        setUserMatches(result.matches)
      }
    } catch (error) {
      console.log('No user matches found')
    } finally {
      setIsLoadingMatches(false)
    }
  }

  // Get matches to display based on showAllMatches state
  // 根据showAllMatches状态获取要显示的比赛
  const displayedMatches = React.useMemo(() => {
    if (showAllMatches) {
      // Show all matches (built-in + user-created)
      // 显示所有比赛（内置+用户创建）
      return [...userMatches, ...BUILT_IN_MATCHES]
    } else {
      // Show only built-in matches (2x2 grid)
      // 只显示内置比赛（2x2网格）
      return BUILT_IN_MATCHES
    }
  }, [userMatches, showAllMatches])

  return (
    <div className="space-y-10">
      <HomeHero />
      <ValueEquation />

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <span>🔥 All Matchups</span>
          </h2>
          {userMatches.length > 0 && (
            <button
              onClick={() => setShowAllMatches(!showAllMatches)}
              className="flex items-center gap-1 text-sm text-blue-400 hover:text-blue-300 transition-colors px-3 py-1 rounded-md hover:bg-blue-400/10"
            >
              <span>{showAllMatches ? 'Show Less' : `View More (${userMatches.length})`}</span>
              <svg 
                className={`w-4 h-4 transition-transform ${showAllMatches ? 'rotate-180' : ''}`}
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          )}
        </div>
        
        {isLoadingMatches ? (
          <div className="text-center text-slate-400 py-8">Loading matches...</div>
        ) : (
          <div className={`grid gap-4 ${
            showAllMatches 
              ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
              : 'grid-cols-1 md:grid-cols-2'
          }`}>
            {displayedMatches.map((m) => (
              <MatchTile key={m.id} id={m.id} teamA={m.teamA} teamB={m.teamB} />
            ))}
          </div>
        )}
        
        {/* Show user matches indicator when collapsed */}
        {/* 折叠时显示用户比赛指示器 */}
        {!showAllMatches && userMatches.length > 0 && (
          <div className="text-center">
            <div className="inline-flex items-center gap-2 text-sm text-slate-400 bg-slate-800/50 px-4 py-2 rounded-full border border-slate-700/50">
              <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              + {userMatches.length} custom match{userMatches.length > 1 ? 'es' : ''} created
            </div>
          </div>
        )}
      </section>

      <section className="pt-4">
        <h3 className="text-lg font-semibold mb-2">Create New Matches</h3>
        <p className="text-sm text-slate-400">
          {isConnected 
            ? "Go to Admin page to create new teams and matches. Your data is stored locally."
            : "Connect your wallet and go to Admin page to create new teams and matches."
          }
        </p>
        {isConnected && (
          <Link 
            to="/admin" 
            className="inline-block mt-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm"
          >
            Go to Admin Page
          </Link>
        )}
      </section>
    </div>
  )
}


