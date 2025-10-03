ParaGoal 本地环境与部署指南（Windows 友好，仅文档）

前置条件

- Windows 10/11（64-bit）。
- Node.js LTS 与 PNPM/NPM；Git；VSCode。
- EVM 钱包（如 MetaMask），已添加 Paseo 测试网。

步骤概览

1) 克隆仓库并安装依赖（稍后实现 package.json 后执行）。
2) 配置环境变量（.env）：
   - VITE_PUBLIC_RPC_URL
   - VITE_PUBLIC_CONTRACT_ADDRESS
   - VITE_PUBLIC_CHAIN_ID（Paseo）
3) 启动前端开发服务器（完成前端后执行）。
4) 合约侧：
   - 使用 Foundry/Hardhat（后续选型）
   - 部署至 Paseo 获取合约地址与 ABI。

Windows 注意事项

- 命令行建议使用 PowerShell 或 Git Bash；如使用 cmd，请根据命令差异调整。
- 安装依赖遇到权限问题时，可使用管理员权限或关闭杀毒拦截。


