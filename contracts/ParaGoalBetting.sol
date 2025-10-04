// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title ParaGoalBetting
 * @dev 基于Polkadot Paseo测试网的去中心化体育博彩智能合约
 * @dev Decentralized sports betting smart contract for Polkadot Paseo testnet
 * @author ParaGoal Team
 */

// 导入OpenZeppelin安全库 / Import OpenZeppelin security libraries
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

contract ParaGoalBetting is ReentrancyGuard, Ownable {
    using SafeMath for uint256;

    // ==================== 事件定义 / Event Definitions ====================
    
    /**
     * @dev 比赛创建事件 / Match created event
     * @param matchId 比赛ID / Match ID
     * @param admin 比赛管理员地址 / Match admin address
     * @param teamA 队伍A标识 / Team A identifier
     * @param teamB 队伍B标识 / Team B identifier
     * @param isBuiltIn 是否为内置比赛 / Whether it's a built-in match
     */
    event MatchCreated(uint256 indexed matchId, address indexed admin, bytes32 teamA, bytes32 teamB, bool isBuiltIn);
    
    /**
     * @dev 队伍更新事件 / Team updated event
     * @param matchId 比赛ID / Match ID
     * @param teamA 队伍A标识 / Team A identifier
     * @param teamB 队伍B标识 / Team B identifier
     */
    event TeamUpdated(uint256 indexed matchId, bytes32 teamA, bytes32 teamB);
    
    /**
     * @dev 奖池注入事件 / Pool injected event
     * @param matchId 比赛ID / Match ID
     * @param from 注入者地址 / Injector address
     * @param amount 注入金额 / Injection amount
     * @param totalPool 总奖池金额 / Total pool amount
     * @param feeReceiver 手续费接收者 / Fee receiver address
     */
    event PoolInjected(uint256 indexed matchId, address indexed from, uint256 amount, uint256 totalPool, address indexed feeReceiver);
    
    /**
     * @dev 用户投注事件 / User staked event
     * @param matchId 比赛ID / Match ID
     * @param user 用户地址 / User address
     * @param team 投注队伍 / Staked team
     * @param amount 投注金额 / Stake amount
     */
    event Staked(uint256 indexed matchId, address indexed user, uint8 team, uint256 amount);
    
    /**
     * @dev 比赛关闭事件 / Match closed event
     * @param matchId 比赛ID / Match ID
     */
    event MatchClosed(uint256 indexed matchId);
    
    /**
     * @dev 比赛结算事件 / Match settled event
     * @param matchId 比赛ID / Match ID
     * @param result 比赛结果 / Match result
     */
    event MatchSettled(uint256 indexed matchId, uint8 result);
    
    /**
     * @dev 奖金领取事件 / Payout claimed event
     * @param matchId 比赛ID / Match ID
     * @param user 用户地址 / User address
     * @param payout 领取金额 / Payout amount
     */
    event PayoutClaimed(uint256 indexed matchId, address indexed user, uint256 payout);

    // ==================== 枚举定义 / Enum Definitions ====================
    
    /**
     * @dev 比赛状态枚举 / Match status enumeration
     */
    enum MatchStatus { 
        Pending,    // 等待开启 / Waiting to open
        Open,       // 开放投注 / Open for betting
        Closed,     // 关闭投注 / Closed for betting
        Settled     // 已结算 / Settled
    }
    
    /**
     * @dev 比赛结果枚举 / Match result enumeration
     */
    enum MatchResult { 
        None,       // 未定结果 / No result
        TeamA,      // 队伍A获胜 / Team A wins
        TeamB       // 队伍B获胜 / Team B wins
    }

    // ==================== 结构体定义 / Struct Definitions ====================
    
    /**
     * @dev 比赛结构体 / Match structure
     */
    struct Match {
        uint256 id;                     // 比赛ID / Match ID
        address admin;                  // 比赛管理员 / Match admin
        bytes32 teamA;                  // 队伍A标识 / Team A identifier
        bytes32 teamB;                  // 队伍B标识 / Team B identifier
        bool isBuiltIn;                // 是否为内置比赛 / Whether it's a built-in match
        address poolInjector;          // 首次注入奖池的地址 / First pool injector address
        uint256 poolAmount;            // 奖池总额 / Total pool amount
        MatchStatus status;            // 比赛状态 / Match status
        MatchResult result;            // 比赛结果 / Match result
        uint256 createdAt;             // 创建时间 / Creation timestamp
        uint256 closedAt;              // 关闭时间 / Closing timestamp
        uint256 settledAt;             // 结算时间 / Settlement timestamp
    }
    
    /**
     * @dev 用户投注结构体 / User stake structure
     */
    struct Stake {
        uint256 matchId;               // 比赛ID / Match ID
        address user;                  // 用户地址 / User address
        uint8 team;                    // 投注队伍 / Staked team (0=TeamA, 1=TeamB)
        uint256 amount;                // 投注金额 / Stake amount
        bool claimed;                  // 是否已领取 / Whether claimed
        uint256 stakedAt;              // 投注时间 / Staking timestamp
    }

    // ==================== 状态变量 / State Variables ====================
    
    uint256 public nextMatchId = 1;    // 下一个比赛ID / Next match ID
    uint256 public constant FEE_RATE = 5; // 手续费率5% / Fee rate 5%
    uint256 public constant WINNER_SHARE = 70; // 赢家分配比例70% / Winner share percentage 70%
    uint256 public constant LOSER_SHARE = 30; // 输家分配比例30% / Loser share percentage 30%
    
    // 存储映射 / Storage mappings
    mapping(uint256 => Match) public matches;                           // 比赛信息 / Match information
    mapping(uint256 => mapping(address => Stake)) public userStakes;    // 用户投注记录 / User stake records
    mapping(uint256 => uint256) public totalStakeTeamA;                 // 队伍A总投注 / Total stake for Team A
    mapping(uint256 => uint256) public totalStakeTeamB;                 // 队伍B总投注 / Total stake for Team B
    mapping(uint256 => uint256) public totalPayoutClaimed;              // 已领取总金额 / Total payout claimed

    // ==================== 修饰符 / Modifiers ====================
    
    /**
     * @dev 只有比赛管理员可以执行 / Only match admin can execute
     * @param matchId 比赛ID / Match ID
     */
    modifier onlyMatchAdmin(uint256 matchId) {
        require(matches[matchId].admin == msg.sender, "ParaGoal: Not match admin");
        _;
    }
    
    /**
     * @dev 比赛必须处于开放状态 / Match must be open
     * @param matchId 比赛ID / Match ID
     */
    modifier whenOpen(uint256 matchId) {
        require(matches[matchId].status == MatchStatus.Open, "ParaGoal: Match not open");
        _;
    }
    
    /**
     * @dev 比赛必须处于关闭状态 / Match must be closed
     * @param matchId 比赛ID / Match ID
     */
    modifier whenClosed(uint256 matchId) {
        require(matches[matchId].status == MatchStatus.Closed, "ParaGoal: Match not closed");
        _;
    }
    
    /**
     * @dev 比赛必须已结算 / Match must be settled
     * @param matchId 比赛ID / Match ID
     */
    modifier whenSettled(uint256 matchId) {
        require(matches[matchId].status == MatchStatus.Settled, "ParaGoal: Match not settled");
        _;
    }
    
    /**
     * @dev 比赛必须存在 / Match must exist
     * @param matchId 比赛ID / Match ID
     */
    modifier matchExists(uint256 matchId) {
        require(matches[matchId].id != 0, "ParaGoal: Match does not exist");
        _;
    }

    // ==================== 构造函数 / Constructor ====================
    
    /**
     * @dev 构造函数 / Constructor
     */
    constructor() Ownable(msg.sender) {
        // 初始化内置比赛 / Initialize built-in matches
        _initializeBuiltInMatches();
    }

    // ==================== 比赛管理函数 / Match Management Functions ====================
    
    /**
     * @dev 创建新比赛 / Create new match
     * @param teamA 队伍A标识 / Team A identifier
     * @param teamB 队伍B标识 / Team B identifier
     * @return matchId 新创建的比赛ID / Newly created match ID
     */
    function createMatch(bytes32 teamA, bytes32 teamB) external returns (uint256) {
        require(teamA != bytes32(0) && teamB != bytes32(0), "ParaGoal: Invalid team identifiers");
        require(teamA != teamB, "ParaGoal: Teams cannot be the same");
        
        uint256 matchId = nextMatchId;
        nextMatchId = nextMatchId.add(1);
        
        matches[matchId] = Match({
            id: matchId,
            admin: msg.sender,          // 创建者自动成为管理员 / Creator automatically becomes admin
            teamA: teamA,
            teamB: teamB,
            isBuiltIn: false,
            poolInjector: address(0),
            poolAmount: 0,
            status: MatchStatus.Pending,
            result: MatchResult.None,
            createdAt: block.timestamp,
            closedAt: 0,
            settledAt: 0
        });
        
        emit MatchCreated(matchId, msg.sender, teamA, teamB, false);
        return matchId;
    }
    
    /**
     * @dev 更新比赛队伍信息 / Update match team information
     * @param matchId 比赛ID / Match ID
     * @param teamA 新的队伍A标识 / New Team A identifier
     * @param teamB 新的队伍B标识 / New Team B identifier
     */
    function updateMatchTeams(
        uint256 matchId, 
        bytes32 teamA, 
        bytes32 teamB
    ) external matchExists(matchId) onlyMatchAdmin(matchId) {
        require(matches[matchId].status == MatchStatus.Pending, "ParaGoal: Can only update pending matches");
        require(teamA != bytes32(0) && teamB != bytes32(0), "ParaGoal: Invalid team identifiers");
        require(teamA != teamB, "ParaGoal: Teams cannot be the same");
        
        matches[matchId].teamA = teamA;
        matches[matchId].teamB = teamB;
        
        emit TeamUpdated(matchId, teamA, teamB);
    }
    
    /**
     * @dev 开启比赛投注 / Open match for betting
     * @param matchId 比赛ID / Match ID
     */
    function openMatch(uint256 matchId) external matchExists(matchId) onlyMatchAdmin(matchId) {
        require(matches[matchId].status == MatchStatus.Pending, "ParaGoal: Match must be pending");
        
        matches[matchId].status = MatchStatus.Open;
        
        emit MatchCreated(matchId, matches[matchId].admin, matches[matchId].teamA, matches[matchId].teamB, matches[matchId].isBuiltIn);
    }
    
    /**
     * @dev 关闭比赛投注 / Close match for betting
     * @param matchId 比赛ID / Match ID
     */
    function closeMatch(uint256 matchId) external matchExists(matchId) onlyMatchAdmin(matchId) {
        require(matches[matchId].status == MatchStatus.Open, "ParaGoal: Match must be open");
        
        matches[matchId].status = MatchStatus.Closed;
        matches[matchId].closedAt = block.timestamp;
        
        emit MatchClosed(matchId);
    }
    
    /**
     * @dev 结算比赛 / Settle match
     * @param matchId 比赛ID / Match ID
     * @param result 比赛结果 / Match result (0=None, 1=TeamA, 2=TeamB)
     */
    function settleMatch(uint256 matchId, uint8 result) external matchExists(matchId) onlyMatchAdmin(matchId) whenClosed(matchId) {
        require(result >= 1 && result <= 2, "ParaGoal: Invalid result");
        
        matches[matchId].result = MatchResult(result);
        matches[matchId].status = MatchStatus.Settled;
        matches[matchId].settledAt = block.timestamp;
        
        emit MatchSettled(matchId, result);
    }

    // ==================== 投注和奖池函数 / Betting and Pool Functions ====================
    
    /**
     * @dev 注入奖池 / Inject pool
     * @param matchId 比赛ID / Match ID
     */
    function injectPool(uint256 matchId) external payable matchExists(matchId) {
        require(msg.value > 0, "ParaGoal: Must inject positive amount");
        require(matches[matchId].status != MatchStatus.Settled, "ParaGoal: Cannot inject into settled match");
        
        // 如果是首次注入，记录注入者作为手续费接收方 / If first injection, record injector as fee receiver
        if (matches[matchId].poolInjector == address(0)) {
            matches[matchId].poolInjector = msg.sender;
        }
        
        matches[matchId].poolAmount = matches[matchId].poolAmount.add(msg.value);
        
        emit PoolInjected(matchId, msg.sender, msg.value, matches[matchId].poolAmount, matches[matchId].poolInjector);
    }
    
    /**
     * @dev 用户投注 / User stake
     * @param matchId 比赛ID / Match ID
     * @param team 投注队伍 / Staked team (0=TeamA, 1=TeamB)
     */
    function stake(uint256 matchId, uint8 team) external payable matchExists(matchId) whenOpen(matchId) {
        require(msg.value > 0, "ParaGoal: Must stake positive amount");
        require(team == 0 || team == 1, "ParaGoal: Invalid team selection");
        
        // 累加用户投注 / Accumulate user stake
        if (userStakes[matchId][msg.sender].amount > 0) {
            // 用户已有投注，累加金额 / User already has stake, accumulate amount
            userStakes[matchId][msg.sender].amount = userStakes[matchId][msg.sender].amount.add(msg.value);
        } else {
            // 用户首次投注 / User's first stake
            userStakes[matchId][msg.sender] = Stake({
                matchId: matchId,
                user: msg.sender,
                team: team,
                amount: msg.value,
                claimed: false,
                stakedAt: block.timestamp
            });
        }
        
        // 更新队伍总投注 / Update team total stake
        if (team == 0) {
            totalStakeTeamA[matchId] = totalStakeTeamA[matchId].add(msg.value);
        } else {
            totalStakeTeamB[matchId] = totalStakeTeamB[matchId].add(msg.value);
        }
        
        emit Staked(matchId, msg.sender, team, msg.value);
    }
    
    /**
     * @dev 领取奖金 / Claim payout
     * @param matchId 比赛ID / Match ID
     */
    function claimPayout(uint256 matchId) external matchExists(matchId) whenSettled(matchId) nonReentrant {
        require(userStakes[matchId][msg.sender].amount > 0, "ParaGoal: No stake found");
        require(!userStakes[matchId][msg.sender].claimed, "ParaGoal: Already claimed");
        
        uint256 payout = calculatePayout(matchId, msg.sender);
        require(payout > 0, "ParaGoal: No payout available");
        
        // 标记为已领取 / Mark as claimed
        userStakes[matchId][msg.sender].claimed = true;
        totalPayoutClaimed[matchId] = totalPayoutClaimed[matchId].add(payout);
        
        // 转账奖金 / Transfer payout
        (bool success, ) = msg.sender.call{value: payout}("");
        require(success, "ParaGoal: Transfer failed");
        
        emit PayoutClaimed(matchId, msg.sender, payout);
    }

    // ==================== 查询函数 / View Functions ====================
    
    /**
     * @dev 获取比赛信息 / Get match information
     * @param matchId 比赛ID / Match ID
     * @return 比赛结构体 / Match struct
     */
    function getMatch(uint256 matchId) external view matchExists(matchId) returns (Match memory) {
        return matches[matchId];
    }
    
    /**
     * @dev 获取用户投注信息 / Get user stake information
     * @param matchId 比赛ID / Match ID
     * @param user 用户地址 / User address
     * @return 用户投注结构体 / User stake struct
     */
    function getUserStake(uint256 matchId, address user) external view returns (Stake memory) {
        return userStakes[matchId][user];
    }
    
    /**
     * @dev 计算用户应得奖金 / Calculate user payout
     * @param matchId 比赛ID / Match ID
     * @param user 用户地址 / User address
     * @return 应得奖金 / Payout amount
     */
    function calculatePayout(uint256 matchId, address user) public view returns (uint256) {
        Stake memory userStake = userStakes[matchId][user];
        if (userStake.amount == 0 || userStake.claimed || matches[matchId].status != MatchStatus.Settled) {
            return 0;
        }
        
        MatchResult result = matches[matchId].result;
        if (result == MatchResult.None) {
            return 0;
        }
        
        uint256 userAmount = userStake.amount;
        uint256 poolAmount = matches[matchId].poolAmount;
        
        // 判断用户投注的队伍是否为获胜方 / Determine if user's staked team is the winner
        bool isWinner = (result == MatchResult.TeamA && userStake.team == 0) || 
                       (result == MatchResult.TeamB && userStake.team == 1);
        
        if (isWinner) {
            // 获胜方计算 / Winner calculation
            uint256 totalStakeWinner = userStake.team == 0 ? totalStakeTeamA[matchId] : totalStakeTeamB[matchId];
            if (totalStakeWinner == 0) return userAmount; // 防止除零 / Prevent division by zero
            
            uint256 userRatio = userAmount.mul(1e18).div(totalStakeWinner); // 使用18位精度 / Use 18 decimals
            uint256 poolShare = poolAmount.mul(WINNER_SHARE).div(100);
            uint256 userPoolShare = userRatio.mul(poolShare).div(1e18);
            uint256 grossPayout = userAmount.add(userPoolShare);
            
            return grossPayout.mul(100 - FEE_RATE).div(100); // 扣除5%手续费 / Deduct 5% fee
        } else {
            // 失败方计算 / Loser calculation
            uint256 totalStakeLoser = userStake.team == 0 ? totalStakeTeamA[matchId] : totalStakeTeamB[matchId];
            if (totalStakeLoser == 0) return userAmount; // 防止除零 / Prevent division by zero
            
            uint256 userRatio = userAmount.mul(1e18).div(totalStakeLoser); // 使用18位精度 / Use 18 decimals
            uint256 poolShare = poolAmount.mul(LOSER_SHARE).div(100);
            uint256 userPoolShare = userRatio.mul(poolShare).div(1e18);
            uint256 grossPayout = userAmount.add(userPoolShare);
            
            return grossPayout.mul(100 - FEE_RATE).div(100); // 扣除5%手续费 / Deduct 5% fee
        }
    }
    
    /**
     * @dev 获取比赛统计信息 / Get match statistics
     * @param matchId 比赛ID / Match ID
     * @return teamAStake 队伍A总投注 / Team A total stake
     * @return teamBStake 队伍B总投注 / Team B total stake
     * @return poolAmount 奖池总额 / Total pool amount
     * @return totalPayoutClaimed 已领取总额 / Total payout claimed
     */
    function getMatchStats(uint256 matchId) external view matchExists(matchId) returns (
        uint256 teamAStake,
        uint256 teamBStake, 
        uint256 poolAmount,
        uint256 totalPayoutClaimed
    ) {
        return (
            totalStakeTeamA[matchId],
            totalStakeTeamB[matchId],
            matches[matchId].poolAmount,
            totalPayoutClaimed[matchId]
        );
    }
    
    /**
     * @dev 检查用户是否为比赛管理员 / Check if user is match admin
     * @param matchId 比赛ID / Match ID
     * @param user 用户地址 / User address
     * @return 是否为管理员 / Whether user is admin
     */
    function isMatchAdmin(uint256 matchId, address user) external view returns (bool) {
        return matches[matchId].admin == user;
    }

    // ==================== 内部函数 / Internal Functions ====================
    
    /**
     * @dev 初始化内置比赛 / Initialize built-in matches
     */
    function _initializeBuiltInMatches() internal {
        // 克罗地亚 vs 巴西 / Croatia vs Brazil
        matches[1] = Match({
            id: 1,
            admin: owner(), // 合约所有者作为内置比赛管理员 / Contract owner as built-in match admin
            teamA: keccak256("Croatia"),
            teamB: keccak256("Brazil"),
            isBuiltIn: true,
            poolInjector: address(0),
            poolAmount: 0,
            status: MatchStatus.Pending,
            result: MatchResult.None,
            createdAt: block.timestamp,
            closedAt: 0,
            settledAt: 0
        });
        
        // 荷兰 vs 阿根廷 / Netherlands vs Argentina
        matches[2] = Match({
            id: 2,
            admin: owner(),
            teamA: keccak256("Netherlands"),
            teamB: keccak256("Argentina"),
            isBuiltIn: true,
            poolInjector: address(0),
            poolAmount: 0,
            status: MatchStatus.Pending,
            result: MatchResult.None,
            createdAt: block.timestamp,
            closedAt: 0,
            settledAt: 0
        });
        
        // 摩洛哥 vs 葡萄牙 / Morocco vs Portugal
        matches[3] = Match({
            id: 3,
            admin: owner(),
            teamA: keccak256("Morocco"),
            teamB: keccak256("Portugal"),
            isBuiltIn: true,
            poolInjector: address(0),
            poolAmount: 0,
            status: MatchStatus.Pending,
            result: MatchResult.None,
            createdAt: block.timestamp,
            closedAt: 0,
            settledAt: 0
        });
        
        // 英格兰 vs 法国 / England vs France
        matches[4] = Match({
            id: 4,
            admin: owner(),
            teamA: keccak256("England"),
            teamB: keccak256("France"),
            isBuiltIn: true,
            poolInjector: address(0),
            poolAmount: 0,
            status: MatchStatus.Pending,
            result: MatchResult.None,
            createdAt: block.timestamp,
            closedAt: 0,
            settledAt: 0
        });
        
        // 更新nextMatchId / Update nextMatchId
        nextMatchId = 5;
        
        // 发出事件 / Emit events
        emit MatchCreated(1, owner(), keccak256("Croatia"), keccak256("Brazil"), true);
        emit MatchCreated(2, owner(), keccak256("Netherlands"), keccak256("Argentina"), true);
        emit MatchCreated(3, owner(), keccak256("Morocco"), keccak256("Portugal"), true);
        emit MatchCreated(4, owner(), keccak256("England"), keccak256("France"), true);
    }
    
    /**
     * @dev 提取合约余额（仅所有者）/ Withdraw contract balance (owner only)
     */
    function withdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "ParaGoal: No balance to withdraw");
        
        (bool success, ) = owner().call{value: balance}("");
        require(success, "ParaGoal: Withdraw failed");
    }
    
    /**
     * @dev 接收以太币 / Receive Ether
     */
    receive() external payable {
        // 允许合约接收以太币 / Allow contract to receive Ether
    }
}
