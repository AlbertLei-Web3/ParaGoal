ParaGoal 智能合约规格（仅文档，无代码）

概览

- 链：Polkadot Paseo 测试网（EVM 兼容环境）。
- 目标：支持创建比赛、队伍管理、奖池注入、用户下注、结算、领取。
- 原则：不包含任何模拟数据；以接口与状态定义为主。

核心实体与存储

- Match（比赛）：
  - id: uint256
  - admin: address  // 创建该比赛的钱包地址（非写死）
  - teamA: bytes32  // 队伍标识（链上存储采用 bytes32，前端映射为可读名称）
  - teamB: bytes32
  - isBuiltIn: bool // 是否为系统内置比赛（四场固定，不可删除）
  - poolInjectedBy: address // 首次向该比赛注入奖池的地址（平台手续费接收者）
  - poolAmount: uint256 // 当前奖池总额（单位：PAS）
  - status: enum { Pending, Open, Closed, Settled }
  - result: enum { None, TeamA, TeamB }

- Stake（用户投注/质押）：
  - matchId: uint256
  - user: address
  - team: enum { TeamA, TeamB }
  - amount: uint256
  - claimed: bool

- 累计权重：
  - totalStakeTeamA[matchId]: uint256
  - totalStakeTeamB[matchId]: uint256

事件（Events）

- MatchCreated(matchId, admin, teamA, teamB, isBuiltIn)
- TeamUpdated(matchId, teamA, teamB)
- PoolInjected(matchId, from, amount, totalPool, feeReceiver)
- Staked(matchId, user, team, amount)
- Closed(matchId)
- Settled(matchId, result)
- Claimed(matchId, user, payout)

权限与流程

- 创建比赛：任意地址可创建，新建后创建者为该比赛 admin。
- 内置比赛：部署或初始化时写入四场，不可删除，admin 逻辑同上（若允许后续注入与结算，admin 可为空或由系统账号托管）。
- 注入奖池：开放调用；若首次注入则记录 poolInjectedBy 为调用者（平台手续费接收者）。
- 下注：在状态为 Open 时可下注，记录到用户质押集合。
- 关闭：仅 admin 可关闭下注（状态 Closed）。
- 结算：仅 admin 可根据真实结果结算（状态 Settled）。
- 领取：用户在 Settled 后可按规则领取。

结算与分配规则

- 定义：
  - S_A：押 TeamA 的总质押
  - S_B：押 TeamB 的总质押
  - P：奖池总额
  - r：用户个人所押比例（相对其方向的总额）
  - 手续费率：5%
  - 分配比例：赢家方向 70%，输家方向 30%

- 对某位用户 u 的方向（若其所押方向为赢家）：
  - 用户份额 = 本金_u + 70% × (r_u × P) − (本金_u + 70% × (r_u × P)) × 5%
  - 其中 r_u = amount_u / S_winner

- 对某位用户 u 的方向（若其所押方向为输家）：
  - 用户份额 = 本金_u + 30% × (r_u × P) − (本金_u + 30% × (r_u × P)) × 5%
  - 其中 r_u = amount_u / S_loser

- 平台手续费归集：
  - 将所有用户扣除的 5% 手续费累计发送至 poolInjectedBy。

边界与保护

- 防止重入：领取与结算流程使用非重入修饰器。
- 精度处理：使用 18 位精度，比例计算采用乘法在前、除法在后，避免精度丢失。
- 状态检查：只能在合法状态下下注/关闭/结算/领取。
- 资金安全：下注与注入使用可升级的收款模式（例如 pull 付款式领取）。
- 冻结窗口：可选，在 Closed 后到 Settled 前阻止进一步下注与领取。

接口（ABI 级别草案）

- createMatch(bytes32 teamA, bytes32 teamB, bool isBuiltIn) returns (uint256 matchId)
- updateTeams(uint256 matchId, bytes32 teamA, bytes32 teamB) onlyAdmin
- injectPool(uint256 matchId) payable
- open(uint256 matchId) onlyAdmin
- close(uint256 matchId) onlyAdmin
- stake(uint256 matchId, uint8 team) payable whenOpen
- settle(uint256 matchId, uint8 result) onlyAdmin whenClosed
- claim(uint256 matchId) nonReentrant afterSettled
- view functions：getMatch(matchId), getUserStake(matchId, user), pendingPayout(matchId, user)

部署与网络

- 网络：Polkadot Paseo 测试网（EVM 端点与RPC由部署时确认）。
- 合约升级：MVP 阶段建议不可升级，降低复杂度。


