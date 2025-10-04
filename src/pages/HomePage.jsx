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

  // Combine built-in matches and user-created matches
  // 合并内置比赛和用户创建的比赛
  const allMatches = React.useMemo(() => {
    return [...userMatches, ...BUILT_IN_MATCHES]
  }, [userMatches])

  return (
    <div className="space-y-10">
      <HomeHero />
      <ValueEquation />

      <section className="space-y-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <span>🔥 All Matchups</span>
        </h2>
        {isLoadingMatches ? (
          <div className="text-center text-slate-400 py-8">Loading matches...</div>
        ) : (
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
            {allMatches.map((m) => (
              <MatchTile key={m.id} id={m.id} teamA={m.teamA} teamB={m.teamB} />
            ))}
          </div>
        )}
      </section>

      {userMatches.length > 0 && (
        <section className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <span>⭐ Your Created Matches</span>
          </h3>
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
            {userMatches.map((m) => (
              <MatchTile key={m.id} id={m.id} teamA={m.teamA} teamB={m.teamB} />
            ))}
          </div>
        </section>
      )}

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


