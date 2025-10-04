# ParaGoal智能合约 / ParaGoal Smart Contracts

基于Polkadot Paseo测试网的去中心化体育博彩智能合约
Decentralized sports betting smart contract for Polkadot Paseo testnet

## 功能特性 / Features

- ✅ 比赛创建和管理 / Match creation and management
- ✅ 用户投注系统 / User betting system  
- ✅ 奖池注入和分配 / Pool injection and distribution
- ✅ 智能结算算法 / Smart settlement algorithm
- ✅ 内置4场固定比赛 / 4 built-in fixed matches
- ✅ 权限管理和安全保护 / Permission management and security protection

## 合约架构 / Contract Architecture

### 核心数据结构 / Core Data Structures
- **Match**: 比赛信息结构体 / Match information struct
- **Stake**: 用户投注记录 / User stake records
- **MatchStatus**: 比赛状态枚举 / Match status enumeration
- **MatchResult**: 比赛结果枚举 / Match result enumeration

### 主要功能 / Main Functions
- `createMatch()`: 创建新比赛 / Create new match
- `injectPool()`: 注入奖池 / Inject pool
- `stake()`: 用户投注 / User stake
- `settleMatch()`: 结算比赛 / Settle match
- `claimPayout()`: 领取奖金 / Claim payout

## 安装和部署 / Installation and Deployment

### 1. 安装依赖 / Install Dependencies
```bash
cd contracts
npm install
```

### 2. 配置环境变量 / Configure Environment Variables
创建 `.env` 文件：
```bash
PRIVATE_KEY=your_private_key_here
RPC_URL=https://testnet-passet-hub-eth-rpc.polkadot.io
```

### 3. 编译合约 / Compile Contracts
```bash
npm run compile
```

### 4. 运行测试 / Run Tests
```bash
npm run test
```

### 5. 部署到Paseo测试网 / Deploy to Paseo Testnet
```bash
npm run deploy:paseo
```

## 内置比赛 / Built-in Matches

合约部署后自动初始化4场内置比赛：
1. 克罗地亚 vs 巴西 / Croatia vs Brazil
2. 荷兰 vs 阿根廷 / Netherlands vs Argentina  
3. 摩洛哥 vs 葡萄牙 / Morocco vs Portugal
4. 英格兰 vs 法国 / England vs France

## 结算规则 / Settlement Rules

### 分配比例 / Distribution Ratios
- **获胜方**: 本金 + 70% × (个人投注比例 × 奖池总额) - 5%手续费
- **失败方**: 本金 + 30% × (个人投注比例 × 奖池总额) - 5%手续费
- **平台手续费**: 所有扣除的5%手续费归集给首次注入奖池的地址

### 数学公式 / Mathematical Formula
```
用户份额 = 本金 + 分配比例 × (个人投注比例 × 奖池总额) - 5%手续费
User Share = Principal + Share Ratio × (Personal Stake Ratio × Pool Amount) - 5% Fee
```

## 安全特性 / Security Features

- ✅ 重入攻击防护 / Reentrancy attack protection
- ✅ 权限控制和访问限制 / Permission control and access restrictions  
- ✅ 溢出保护和精度处理 / Overflow protection and precision handling
- ✅ 状态机严格验证 / Strict state machine validation
- ✅ 边界条件检查 / Boundary condition checks

## 测试页面集成 / Test Page Integration

部署后，请更新前端配置：
```javascript
// 在 src/services/contractConfig.js 中更新
export const CONTRACT_ADDRESS = "your_deployed_contract_address";
export const CONTRACT_ABI = [...]; // 部署后的ABI
```

## 网络信息 / Network Information

- **网络名称**: Paseo Asset Hub
- **链ID**: 1111
- **RPC URL**: https://testnet-passet-hub-eth-rpc.polkadot.io
- **区块浏览器**: https://assethub-paseo.subscan.io
- **原生代币**: PAS (10位小数)

## 获取测试币 / Get Test Tokens

访问Paseo测试网水龙头获取PAS测试币：
- 官方水龙头: https://faucet.polkadot.io/
- 或通过Polkadot.js钱包申请

## 许可证 / License

MIT License - 详见 LICENSE 文件
MIT License - See LICENSE file for details
