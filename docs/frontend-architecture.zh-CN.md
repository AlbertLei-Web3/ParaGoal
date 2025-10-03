ParaGoal 前端信息架构（仅文档，无代码）

技术栈

- React + Vite（或 Next.js SPA 模式），TailwindCSS，Ethers/viem 与 EVM 钱包连接库。

路由结构

- `/` 首页：
  - 顶部：站点名、钱包连接按钮。
  - 主体：四场固定比赛卡片 + 动态比赛列表。
  - 右下角：Admin 浮动按钮（任意连接钱包后可见）。

- `/match/:id` 对战页：
  - 比赛双方展示、下注入口、奖池信息、AI 分析按钮（静态规则文本）。
  - 结算后显示可领取金额与领取按钮。

- `/admin` 管理台：
  - 队伍增删改查、创建比赛、打开/关闭/结算、注入奖池。

核心组件

- `WalletConnectButton`
- `MatchCard`
- `MatchList`
- `AdminFab`（右下角浮动按钮）
- `StakePanel`（输入金额/选择队伍）
- `PoolPanel`（显示奖池与注入）
- `AiAnalysisPanel`（静态规则文案）
- `ClaimPanel`

状态与数据

- 全局：当前账户、网络、合约地址、ABI。
- 比赛数据：从合约读取（内置比赛 + 动态创建）。
- 下注与奖池：读链上状态；提交交易后追踪 pending/confirmed 状态。

样式与交互

- TailwindCSS 主题：深浅色可选；卡片式布局；一致的间距与圆角。
- 重要动作按钮提供加载状态与错误提示。

合约交互适配

- 使用 Ethers/viem：
  - 读取：比赛信息、总质押、个人质押、可领取金额。
  - 写入：createMatch、injectPool、stake、close、settle、claim。


