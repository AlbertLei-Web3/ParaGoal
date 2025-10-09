// Admin 页面（中英文详尽注释，便于初学者理解实现意图）
// Chinese：
// - 本页面提供「添加队伍」与「创建新比赛」的表单交互，采用下拉选择框。
// - 所有新建数据仅存于内存状态，作为 UI 占位，不会写入链或本地存储；不预置任何虚构数据。
// - 「已存在比赛」列表会展示系统内置的四场固定比赛；此外，用户在本页创建的比赛只在本页演示显示。
// English:
// - This page provides dropdown-based forms for "Add Team" and "Create New Match".
// - Newly created items live only in component state as UI placeholders. No on-chain writes, no local persistence, no fake seed data.
// - "Existing Matches" shows the four built-in matches; user-created matches are also shown here for demo purposes.
import React from 'react'
import toast from 'react-hot-toast'
import { GlowCard } from '../components/GlowCard'
import { BUILT_IN_MATCHES } from '../shared/builtinMatches'
import { useWallet } from '../contexts/WalletContext'
import { saveTeamsToIPFS, loadTeamsFromIPFS, saveMatchesToIPFS, loadMatchesFromIPFS, generateUserCID } from '../services/ipfsStorage'
import { ContractPromise } from '@polkadot/api-contract'
import { getApi } from '../services/web3Client'
import { CONTRACT_ADDRESS, CONTRACT_METADATA } from '../services/contractConfig'
import { web3FromAddress } from '@polkadot/extension-dapp'
import { makeGasLimit, pickMessage } from '../services/contractsCompat'

export function AdminPage() {
  const { address, isConnected, isCorrectNetwork } = useWallet()
  
  // ------------------------
  // Team state with IPFS persistence
  // ------------------------
  const [teamInput, setTeamInput] = React.useState('')
  const [teamWinRate, setTeamWinRate] = React.useState('50')
  const [teamAvgAge, setTeamAvgAge] = React.useState('26')
  const [teamInjuries, setTeamInjuries] = React.useState('2')
  
  const builtInTeams = React.useMemo(() => {
    // Collect unique team names from built-ins
    const set = new Set()
    for (const m of BUILT_IN_MATCHES) {
      set.add(m.teamA)
      set.add(m.teamB)
    }
    return Array.from(set)
  }, [])
  
  const [customTeams, setCustomTeams] = React.useState([])
  const [isLoadingTeams, setIsLoadingTeams] = React.useState(false)

  const allTeams = React.useMemo(() => {
    return [...builtInTeams.map(name => ({ name })), ...customTeams]
  }, [builtInTeams, customTeams])

  const [teamA, setTeamA] = React.useState('')
  const [teamB, setTeamB] = React.useState('')
  const [createdMatches, setCreatedMatches] = React.useState([])

  // Load teams and matches from localStorage on wallet connect
  // 钱包连接时从本地存储加载队伍和比赛数据
  React.useEffect(() => {
    if (address && isConnected) {
      loadTeamsFromStorage()
      loadMatchesFromStorage()
    }
  }, [address, isConnected])

  const loadTeamsFromStorage = async () => {
    setIsLoadingTeams(true)
    try {
      const result = await loadTeamsFromIPFS()
      if (result.success) {
        setCustomTeams(result.teams)
        if (result.teams.length > 0) {
          toast.success('Teams loaded from local storage')
        }
      }
    } catch (error) {
      console.log('No existing teams found, starting fresh')
    } finally {
      setIsLoadingTeams(false)
    }
  }

  const loadMatchesFromStorage = async () => {
    try {
      const result = await loadMatchesFromIPFS()
      if (result.success) {
        setCreatedMatches(result.matches)
        if (result.matches.length > 0) {
          toast.success('Matches loaded from local storage')
        }
      }
    } catch (error) {
      console.log('No existing matches found, starting fresh')
    }
  }

  // Handle adding team with IPFS persistence
  const handleAddTeam = async (e) => {
    e.preventDefault()
    
    if (!address) {
      toast.error('Please connect wallet first')
      return
    }
    
    const name = teamInput.trim()
    if (!name) {
      toast.error('Team name is required')
      return
    }
    
    if (allTeams.some(team => team.name === name)) {
      toast.error('Team already exists')
      return
    }
    
    setIsLoadingTeams(true)
    
    try {
      const newTeam = {
        name,
        winRate: parseInt(teamWinRate) || 50,
        avgAge: parseInt(teamAvgAge) || 26,
        injuries: parseInt(teamInjuries) || 2
      }
      
      const updatedTeams = [...customTeams, newTeam]
      setCustomTeams(updatedTeams)
      
      // Save to localStorage
      const result = await saveTeamsToIPFS(updatedTeams)
      if (result.success) {
        toast.success(`Team "${name}" added successfully!`)
        // Reset form
        setTeamInput('')
        setTeamWinRate('50')
        setTeamAvgAge('26')
        setTeamInjuries('2')
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      toast.error(`Failed to add team: ${error.message}`)
      console.error('Add team error:', error)
    } finally {
      setIsLoadingTeams(false)
    }
  }

  // Handle deleting a custom team
  const handleDeleteTeam = async (teamToDelete) => {
    if (!address) {
      toast.error('Please connect wallet first')
      return
    }

    setIsLoadingTeams(true)
    
    try {
      const updatedTeams = customTeams.filter(team => team.name !== teamToDelete)
      setCustomTeams(updatedTeams)
      
      // Save to localStorage
      const result = await saveTeamsToIPFS(updatedTeams)
      if (result.success) {
        toast.success(`Team "${teamToDelete}" deleted successfully!`)
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      toast.error(`Failed to delete team: ${error.message}`)
      console.error('Delete team error:', error)
      // Revert state on error
      setCustomTeams(customTeams)
    } finally {
      setIsLoadingTeams(false)
    }
  }

  // Create a match on-chain and also mirror it locally (id mapping不可用时，前端使用链上 id 展示)
  // Chinese: 将比赛写入链上，并在本地镜像展示（不再使用 local- 前缀）。
  const handleCreateMatch = async (e) => {
    e.preventDefault()
    if (!teamA || !teamB || teamA === teamB) {
      toast.error('Please select two different teams (A and B)')
      return
    }
    
    if (!address) {
      toast.error('Please connect wallet first')
      return
    }
    
    try {
      // 1) 上链创建
      const api = await getApi()
      const contract = new ContractPromise(api, CONTRACT_METADATA, CONTRACT_ADDRESS)
      const injector = await web3FromAddress(address)
      const gasLimit = makeGasLimit(api, { refTime: 3_000_000_000, proofSize: 300_000, legacyWeight: 6_000_000_000 })
      const qCreate = pickMessage(contract.query, 'create_match', 'createMatch')
      const tCreate = pickMessage(contract.tx, 'create_match', 'createMatch')
      if (!qCreate || !tCreate) throw new Error('create_match message not found in ABI')

      // bytes32 编码
      const enc = (name) => {
        const encoder = new TextEncoder();
        const bytes = encoder.encode(name)
        const arr = new Uint8Array(32); arr.fill(0); arr.set(bytes.slice(0, 32));
        return arr
      }
      const a = enc(teamA)
      const b = enc(teamB)

      const { gasRequired, result, output } = await qCreate(address, { gasLimit }, a, b)
      if (result.isErr) throw new Error('Query failed')

      await tCreate({ gasLimit: gasRequired }, a, b).signAndSend(address, { signer: injector.signer }, (res) => {
        if (res.status?.isInBlock) {
          // 2) 前端展示：尝试从 dry-run 输出读取新 matchId
          let newId = undefined
          try {
            const j = output?.toJSON?.();
            newId = j?.ok ?? j?.Ok ?? null;
          } catch {}
          if (newId == null) {
            const human = output?.toHuman?.();
            newId = human?.Ok ?? human?.ok ?? null
          }

          // 3) 同步到本地展示列表（链上 id）
          const created = {
            id: newId ?? `local-${Date.now()}`,
            teamA,
            teamB,
            createdAt: Date.now()
          }
          const updatedMatches = [created, ...createdMatches]
          setCreatedMatches(updatedMatches)
          saveMatchesToIPFS(updatedMatches)
          toast.success('Match created on-chain successfully!')
          setTeamA('')
          setTeamB('')
        }
      })
    } catch (error) {
      toast.error(`Failed to create match: ${error.message}`)
      console.error('Create match error:', error)
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Match Management</h1>
        {isConnected && (
          <div className="text-sm text-slate-400">
            Connected as: <span className="font-mono text-slate-200">{address?.slice(0, 6)}...{address?.slice(-4)}</span>
            {!isCorrectNetwork && (
              <span className="ml-2 text-yellow-400">⚠️ Switch to Paseo Testnet</span>
            )}
          </div>
        )}
      </div>

      {/* Add Team */}
      <GlowCard className="p-6">
        <h2 className="text-lg font-semibold text-slate-200 mb-4">Add New Team</h2>
        <form onSubmit={handleAddTeam} className="space-y-4">
          <div>
            <label className="block text-sm text-slate-400 mb-1">Team Name</label>
            <input
              value={teamInput}
              onChange={(e) => setTeamInput(e.target.value)}
              placeholder="Enter team name"
              className="w-full rounded-md bg-slate-900/60 border border-slate-700/60 px-3 py-2 text-slate-100 placeholder:text-slate-500"
              required
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1">Win Rate (%)</label>
              <input
                type="number"
                value={teamWinRate}
                onChange={(e) => setTeamWinRate(e.target.value)}
                placeholder="50"
                min="0"
                max="100"
                className="w-full rounded-md bg-slate-900/60 border border-slate-700/60 px-3 py-2 text-slate-100 placeholder:text-slate-500"
              />
            </div>
            
            <div>
              <label className="block text-sm text-slate-400 mb-1">Average Age</label>
              <input
                type="number"
                value={teamAvgAge}
                onChange={(e) => setTeamAvgAge(e.target.value)}
                placeholder="26"
                min="16"
                max="50"
                className="w-full rounded-md bg-slate-900/60 border border-slate-700/60 px-3 py-2 text-slate-100 placeholder:text-slate-500"
              />
            </div>
            
            <div>
              <label className="block text-sm text-slate-400 mb-1">Injured Players</label>
              <input
                type="number"
                value={teamInjuries}
                onChange={(e) => setTeamInjuries(e.target.value)}
                placeholder="2"
                min="0"
                max="20"
                className="w-full rounded-md bg-slate-900/60 border border-slate-700/60 px-3 py-2 text-slate-100 placeholder:text-slate-500"
              />
            </div>
          </div>
          
          <button
            type="submit"
            disabled={isLoadingTeams}
            className="w-full rounded-md bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white px-4 py-2"
          >
            {isLoadingTeams ? 'Adding Team...' : '+ Add Team'}
          </button>
        </form>
      </GlowCard>

      {/* Create New Match */}
      <GlowCard className="p-6">
        <h2 className="font-semibold text-slate-200 mb-4">Create New Match</h2>
        <form onSubmit={handleCreateMatch} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-slate-400 mb-1">Team A</label>
            <select
              value={teamA}
              onChange={(e) => setTeamA(e.target.value)}
              className="w-full rounded-md bg-slate-900/60 border border-slate-700/60 px-3 py-2 text-slate-100"
            >
              <option value="">Select Team A</option>
              {allTeams.map((team) => (
                <option key={`A-${team.name}`} value={team.name}>{team.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">Team B</label>
            <select
              value={teamB}
              onChange={(e) => setTeamB(e.target.value)}
              className="w-full rounded-md bg-slate-900/60 border border-slate-700/60 px-3 py-2 text-slate-100"
            >
              <option value="">Select Team B</option>
              {allTeams.map((team) => (
                <option key={`B-${team.name}`} value={team.name}>{team.name}</option>
              ))}
            </select>
          </div>
          <div className="md:col-span-2">
            <button type="submit" className="w-full rounded-md bg-blue-600 hover:bg-blue-700 text-white py-3">Create Match</button>
          </div>
        </form>
      </GlowCard>

      {/* Custom Teams List */}
      <div className="space-y-3">
        <h2 className="text-xl font-semibold">Your Custom Teams</h2>
        {customTeams.length === 0 ? (
          <GlowCard className="p-4 text-center text-slate-400">
            No custom teams yet. Add your first team above!
          </GlowCard>
        ) : (
          <div className="grid gap-3">
            {customTeams.map((team) => (
              <GlowCard key={team.name} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="text-slate-100 font-medium text-lg">{team.name}</div>
                    <div className="text-sm text-slate-400 mt-1">
                      Win Rate: {team.winRate}% • Avg Age: {team.avgAge} • Injuries: {team.injuries}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteTeam(team.name)}
                    disabled={isLoadingTeams}
                    className="ml-4 px-3 py-1 rounded bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-sm"
                  >
                    {isLoadingTeams ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </GlowCard>
            ))}
          </div>
        )}
      </div>

      {/* Existing Matches */}
      <div className="space-y-3">
        <h2 className="text-xl font-semibold">Existing Matches</h2>
        <div className="grid gap-3">
          {[...createdMatches, ...BUILT_IN_MATCHES].map((m) => (
            <GlowCard key={m.id} className="p-4">
              <div className="flex items-center justify-between">
                <div className="text-slate-100 font-medium">{m.teamA}</div>
                <div className="text-slate-400">VS</div>
                <div className="text-slate-100 font-medium">{m.teamB}</div>
              </div>
              <div className="text-xs text-slate-500 mt-1">{String(m.id).startsWith('local-') ? 'Local (UI only)' : 'Built-in'}</div>
            </GlowCard>
          ))}
        </div>
      </div>

      <p className="text-sm text-slate-500">Note: Team data is stored locally in your browser. Each user has independent storage.</p>
    </div>
  )
}


