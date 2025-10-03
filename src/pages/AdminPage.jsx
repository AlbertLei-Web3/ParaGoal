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
import { GlowCard } from '../components/GlowCard'
import { BUILT_IN_MATCHES } from '../shared/builtinMatches'

export function AdminPage() {
  // ------------------------
  // Local state for UI-only demo; not persisted and not on-chain
  // ------------------------
  const [teamInput, setTeamInput] = React.useState('')
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

  const allTeams = React.useMemo(() => {
    return [...builtInTeams, ...customTeams]
  }, [builtInTeams, customTeams])

  const [teamA, setTeamA] = React.useState('')
  const [teamB, setTeamB] = React.useState('')
  const [createdMatches, setCreatedMatches] = React.useState([])

  // Handle adding team into in-memory list only
  function handleAddTeam(e) {
    e.preventDefault()
    const name = teamInput.trim()
    if (!name) return
    if (allTeams.includes(name)) {
      alert('Team already exists (built-in or added)')
      return
    }
    setCustomTeams((prev) => [...prev, name])
    setTeamInput('')
  }

  // Create a match in local state only
  function handleCreateMatch(e) {
    e.preventDefault()
    if (!teamA || !teamB || teamA === teamB) {
      alert('Please select two different teams (A and B)')
      return
    }
    setCreatedMatches((prev) => [
      // Temp id for UI-only
      { id: `local-${Date.now()}`, teamA, teamB },
      ...prev,
    ])
    // Reset selects
    setTeamA('')
    setTeamB('')
  }

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold">Match Management</h1>

      {/* Add Team */}
      <GlowCard className="p-4">
        <form onSubmit={handleAddTeam} className="flex items-center gap-3">
          <input
            value={teamInput}
            onChange={(e) => setTeamInput(e.target.value)}
            placeholder="Add Team"
            className="flex-1 rounded-md bg-slate-900/60 border border-slate-700/60 px-3 py-2 text-slate-100 placeholder:text-slate-500"
            title="Placeholder: add team name (no chain)"
          />
          <button
            type="submit"
            className="rounded-md bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2"
          >
            + Add Team
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
              {allTeams.map((name) => (
                <option key={`A-${name}`} value={name}>{name}</option>
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
              {allTeams.map((name) => (
                <option key={`B-${name}`} value={name}>{name}</option>
              ))}
            </select>
          </div>
          <div className="md:col-span-2">
            <button type="submit" className="w-full rounded-md bg-blue-600 hover:bg-blue-700 text-white py-3">Create Match</button>
          </div>
        </form>
      </GlowCard>

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

      <p className="text-sm text-slate-500">Note: All interactions here are UI-only placeholders. Real on-chain writes will replace them once integrated.</p>
    </div>
  )
}


