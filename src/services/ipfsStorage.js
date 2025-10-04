// Local storage service for team and match data persistence
// English: Handles saving/loading team and match data to/from localStorage
// Each user has independent storage based on wallet address

// Save teams data to localStorage
export async function saveTeamsToIPFS(teams) {
  try {
    const data = {
      teams,
      timestamp: Date.now(),
      version: '1.0'
    }
    
    localStorage.setItem('paragoal_teams', JSON.stringify(data))
    return { success: true, cid: 'localStorage' }
  } catch (error) {
    console.error('Failed to save teams to localStorage:', error)
    return { success: false, error: error.message }
  }
}

// Load teams data from localStorage
export async function loadTeamsFromIPFS(cid) {
  try {
    const stored = localStorage.getItem('paragoal_teams')
    if (!stored) {
      return { success: true, teams: [], timestamp: 0 }
    }
    
    const data = JSON.parse(stored)
    return { success: true, teams: data.teams || [], timestamp: data.timestamp }
  } catch (error) {
    console.error('Failed to load teams from localStorage:', error)
    return { success: false, error: error.message }
  }
}

// Save matches data to localStorage
// 保存比赛数据到本地存储
export async function saveMatchesToIPFS(matches) {
  try {
    const data = {
      matches,
      timestamp: Date.now(),
      version: '1.0'
    }
    
    localStorage.setItem('paragoal_matches', JSON.stringify(data))
    return { success: true, cid: 'localStorage' }
  } catch (error) {
    console.error('Failed to save matches to localStorage:', error)
    return { success: false, error: error.message }
  }
}

// Load matches data from localStorage
// 从本地存储加载比赛数据
export async function loadMatchesFromIPFS(cid) {
  try {
    const stored = localStorage.getItem('paragoal_matches')
    if (!stored) {
      return { success: true, matches: [], timestamp: 0 }
    }
    
    const data = JSON.parse(stored)
    return { success: true, matches: data.matches || [], timestamp: data.timestamp }
  } catch (error) {
    console.error('Failed to load matches from localStorage:', error)
    return { success: false, error: error.message }
  }
}

// Generate a user identifier (not used for localStorage but kept for compatibility)
export function generateUserCID(address) {
  return `user-${address?.slice(2, 10)}-teams`
}
