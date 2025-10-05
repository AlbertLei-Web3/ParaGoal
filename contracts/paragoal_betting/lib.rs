
// ParaGoalBetting Ink! Contract
// 中文: ParaGoalBetting Ink! 智能合约 - 这是一个基于Rust的Polkadot/Substrate合约，用于实现足球比赛投注系统。
// English: ParaGoalBetting Ink! Smart Contract - This is a Rust-based contract for Polkadot/Substrate, implementing a football match betting system.
// 注释说明: 这个合约严格遵循设计文档，包括比赛管理、admin权限、投注结算等。初学者注意: Ink! 使用 #[ink(...)] 宏定义合约元素，存储在 #[ink(storage)] 中。

#![cfg_attr(not(feature = "std"), no_std, no_main)]

#[ink::contract]
mod paragoal_betting {
    use ink::storage::Mapping;

    // 枚举定义: 比赛状态 / Enum: Match Status
    // 中文: 定义比赛的生命周期状态，从Pending开始，到Settled结束。初学者: 枚举是Rust中定义固定选项的方式，这里用于状态机控制。
    // English: Defines the lifecycle states of a match, from Pending to Settled. For beginners: Enums in Rust define fixed options, used here for state machine control.
    #[derive(scale::Encode, scale::Decode, Debug, PartialEq, Eq, Copy, Clone)]
    #[cfg_attr(feature = "std", derive(scale_info::TypeInfo))]
    pub enum MatchStatus {
        Pending,  // 等待开启 / Pending for opening
        Open,     // 开放投注 / Open for betting
        Closed,   // 关闭投注 / Closed for betting
        Settled,  // 已结算 / Settled
    }

    // 枚举定义: 队伍选择 / Enum: Team Selection
    // 中文: 用户投注时选择队伍，0为TeamA，1为TeamB。初学者: u8 用于节省存储空间。
    // English: User selects team when betting, 0 for TeamA, 1 for TeamB. For beginners: u8 is used to save storage space.
    #[derive(scale::Encode, scale::Decode, Debug, PartialEq, Eq, Copy, Clone)]
    #[cfg_attr(feature = "std", derive(scale_info::TypeInfo))]
    pub enum Team {
        TeamA,  // 队伍A / Team A
        TeamB,  // 队伍B / Team B
    }

    // 枚举定义: 比赛结果 / Enum: Match Result
    // 中文: 结算时设置结果，None表示未结算。初学者: 这用于确定赢家和输家。
    // English: Set during settlement, None means not settled. For beginners: This determines winners and losers.
    #[derive(scale::Encode, scale::Decode, Debug, PartialEq, Eq, Copy, Clone)]
    #[cfg_attr(feature = "std", derive(scale_info::TypeInfo))]
    pub enum MatchResult {
        None,    // 未结算 / Not settled
        TeamA,   // TeamA获胜 / TeamA wins
        TeamB,   // TeamB获胜 / TeamB wins
        Draw,    // 平局 / Draw
    }

    // 结构体定义: 比赛 / Struct: Match
    // 中文: 存储每场比赛的信息，包括ID、admin、队伍等。初学者: #[derive] 添加了序列化支持，便于链上存储。
    // English: Stores information for each match, including ID, admin, teams, etc. For beginners: #[derive] adds serialization support for on-chain storage.
    #[derive(scale::Encode, scale::Decode, Debug, Clone, ink::storage::traits::Storable, ink::storage::traits::StorageLayout, scale_info::TypeInfo, ink::storage::traits::Packed)]
    pub struct Match {
        pub id: u128,                // 比赛ID / Match ID
        pub admin: AccountId,        // 管理员地址（创建者） / Admin address (creator)
        pub team_a: [u8; 32],        // 队伍A标识（bytes32） / Team A identifier (bytes32)
        pub team_b: [u8; 32],        // 队伍B标识（bytes32） / Team B identifier (bytes32)
        pub is_built_in: bool,       // 是否内置比赛 / Is built-in match
        pub pool_injected_by: Option<AccountId>,  // 首次注入奖池的地址 / First pool injector address
        pub pool_amount: Balance,    // 奖池总额 / Total pool amount
        pub status: MatchStatus,     // 当前状态 / Current status
        pub result: MatchResult,     // 比赛结果 / Match result
        pub total_stake_a: Balance,  // TeamA总投注 / Total stake for TeamA
        pub total_stake_b: Balance,  // TeamB总投注 / Total stake for TeamB
    }

    // 结构体定义: 用户投注记录 / Struct: Stake
    // 中文: 记录用户的投注细节。初学者: Option<Balance> 表示可选值，如果未设置则为None。
    // English: Records user's betting details. For beginners: Option<Balance> means optional value, None if not set.
    #[derive(scale::Encode, scale::Decode, Debug, Clone, ink::storage::traits::Storable, ink::storage::traits::StorageLayout, scale_info::TypeInfo, ink::storage::traits::Packed)]
    pub struct Stake {
        pub team: Team,         // 投注队伍 / Bet team
        pub amount: Balance,    // 投注金额 / Stake amount
        pub claimed: bool,      // 是否已领取 / Has claimed
    }

    // 事件定义 / Events
    // 中文: Ink!事件用于通知链外（如前端）合约变化。初学者: #[ink(event)] 定义事件结构体。
    // English: Ink! events notify off-chain (e.g., frontend) of contract changes. For beginners: #[ink(event)] defines event structs.
    #[ink(event)]
    pub struct MatchCreated {
        match_id: u128,
        admin: AccountId,
        team_a: [u8; 32],
        team_b: [u8; 32],
        is_built_in: bool,
    }

    #[ink(event)]
    pub struct PoolInjected {
        match_id: u128,
        from: AccountId,
        amount: Balance,
        total_pool: Balance,
    }

    #[ink(event)]
    pub struct Staked {
        match_id: u128,
        user: AccountId,
        team: Team,
        amount: Balance,
    }

    #[ink(event)]
    pub struct MatchClosed {
        match_id: u128,
    }

    #[ink(event)]
    pub struct MatchSettled {
        match_id: u128,
        result: MatchResult,
    }

    #[ink(event)]
    pub struct PayoutClaimed {
        match_id: u128,
        user: AccountId,
        amount: Balance,
    }

    // 合约存储 / Contract Storage
    // 中文: 所有持久化数据存储在这里。初学者: Mapping 类似于Solidity的mapping，用于键值存储。
    // English: All persistent data is stored here. For beginners: Mapping is similar to Solidity's mapping for key-value storage.
    #[ink(storage)]
    #[derive(Default)]
    pub struct ParaGoalBetting {
        next_match_id: u128,                              // 下一个比赛ID / Next match ID
        matches: Mapping<u128, Match>,                    // 比赛映射 / Matches mapping
        stakes: Mapping<(u128, AccountId), Stake>,        // 投注记录 / Stakes mapping (match_id, user)
        fee_receiver: Mapping<u128, AccountId>,           // 每个比赛的手续费接收者 / Fee receiver per match
        deployer: AccountId,
    }

    impl ParaGoalBetting {
        // 构造函数 / Constructor
        // 中文: 初始化合约，设置内置比赛（4场固定）。初学者: #[ink(constructor)] 表示这是合约部署时调用的函数。
        // English: Initializes the contract, sets up built-in matches (4 fixed). For beginners: #[ink(constructor)] marks this as the deployment function.
        #[ink(constructor)]
        pub fn new() -> Self {
            let mut instance = Self::default();
            // 初始化4场内置比赛 / Initialize 4 built-in matches
            // 中文: 根据设计，内置4场固定比赛，admin设置为合约部署者。初学者: 这里循环创建比赛。
            // English: As per design, 4 fixed built-in matches, admin set to deployer. For beginners: Loop to create matches.
            let built_in_teams = vec![
                ([0u8; 32], [1u8; 32]),  // 克罗地亚 vs 巴西 (placeholders) / Croatia vs Brazil
                ([2u8; 32], [3u8; 32]),  // 荷兰 vs 阿根廷 / Netherlands vs Argentina
                ([4u8; 32], [5u8; 32]),  // 摩洛哥 vs 葡萄牙 / Morocco vs Portugal
                ([6u8; 32], [7u8; 32]),  // 英格兰 vs 法国 / England vs France
            ];
            for (team_a, team_b) in built_in_teams {
                let match_id = instance.next_match_id;
                instance.next_match_id += 1;
                instance.matches.insert(match_id, &Match {
                    id: match_id,
                    admin: Self::env().caller(),  // 部署者为admin / Deployer as admin
                    team_a,
                    team_b,
                    is_built_in: true,
                    pool_injected_by: None,
                    pool_amount: 0,
                    status: MatchStatus::Pending,
                    result: MatchResult::None,
                    total_stake_a: 0,
                    total_stake_b: 0,
                });
                instance.env().emit_event(MatchCreated {
                    match_id,
                    admin: Self::env().caller(),
                    team_a,
                    team_b,
                    is_built_in: true,
                });
            }
            instance.deployer = Self::env().caller();  // Use caller for initialization, no Default needed
            instance
        }

        // 函数: 创建比赛 / Function: Create Match
        // 中文: 用户创建新比赛，调用者自动成为admin。初学者: #[ink(message)] 表示可外部调用，payable表示可接收资金（但这里不需）。
        // English: User creates a new match, caller becomes admin automatically. For beginners: #[ink(message)] makes it externally callable, payable allows receiving funds (not needed here).
        #[ink(message)]
        pub fn create_match(&mut self, team_a: [u8; 32], team_b: [u8; 32]) -> u128 {
            let match_id = self.next_match_id;
            self.next_match_id += 1;
            let caller = self.env().caller();
            self.matches.insert(match_id, &Match {
                id: match_id,
                admin: caller,  // 调用者即admin / Caller is admin
                team_a,
                team_b,
                is_built_in: false,
                pool_injected_by: None,
                pool_amount: 0,
                status: MatchStatus::Pending,
                result: MatchResult::None,
                total_stake_a: 0,
                total_stake_b: 0,
            });
            self.env().emit_event(MatchCreated {
                match_id,
                admin: caller,
                team_a,
                team_b,
                is_built_in: false,
            });
            match_id
        }

        // 函数: 注入奖池 / Function: Inject Pool
        // 中文: 向比赛注入奖池资金，如果是首次，设置注入者为手续费接收者。初学者: payable 表示函数可接收链上转账。
        // English: Inject funds into the match pool; if first time, set injector as fee receiver. For beginners: payable means the function can receive on-chain transfers.
        #[ink(message, payable)]
        pub fn inject_pool(&mut self, match_id: u128) {
            let injected = self.env().transferred_value();
            assert!(injected > 0, "Injected amount must be >0");
            let mut match_data = self.matches.get(&match_id).expect("Match not found");
            assert!(match_data.status != MatchStatus::Settled, "Cannot inject to settled match");

            if match_data.pool_injected_by.is_none() {
                match_data.pool_injected_by = Some(self.env().caller());
                self.fee_receiver.insert(match_id, &self.env().caller());
            }
            match_data.pool_amount = match_data.pool_amount.checked_add(injected).expect("Overflow");
            self.matches.insert(match_id, &match_data);

            self.env().emit_event(PoolInjected {
                match_id,
                from: self.env().caller(),
                amount: injected,
                total_pool: match_data.pool_amount,
            });
        }

        // 函数: 开启比赛投注 / Function: Open Match
        // 中文: 仅admin可调用，将状态从Pending变为Open。初学者: 使用assert! 检查权限和状态。
        // English: Only admin can call, changes status from Pending to Open. For beginners: assert! checks permissions and status.
        #[ink(message)]
        pub fn open_match(&mut self, match_id: u128) {
            let mut match_data = self.matches.get(&match_id).expect("Match not found");
            assert!(match_data.admin == self.env().caller(), "Only admin");
            assert!(match_data.status == MatchStatus::Pending, "Not pending");
            match_data.status = MatchStatus::Open;
            self.matches.insert(match_id, &match_data);
            // 无特定事件，但可添加 / No specific event, but can add if needed
        }

        // 函数: 关闭比赛投注 / Function: Close Match
        // 中文: 仅admin可调用，将状态从Open变为Closed。
        // English: Only admin can call, changes status from Open to Closed.
        #[ink(message)]
        pub fn close_match(&mut self, match_id: u128) {
            let mut match_data = self.matches.get(&match_id).expect("Match not found");
            assert!(match_data.admin == self.env().caller(), "Only admin");
            assert!(match_data.status == MatchStatus::Open, "Not open");
            match_data.status = MatchStatus::Closed;
            self.matches.insert(match_id, &match_data);
            self.env().emit_event(MatchClosed { match_id });
        }

        // 函数: 投注 / Function: Stake
        // 中文: 用户投注，选择队伍，更新总投注。初学者: payable接收投注金额。
        // English: User stakes on a team, updates total stakes. For beginners: payable receives the stake amount.
        #[ink(message, payable)]
        pub fn stake(&mut self, match_id: u128, team: Team) {
            let amount = self.env().transferred_value();
            assert!(amount > 0, "Stake amount must be >0");
            let mut match_data = self.matches.get(&match_id).expect("Match not found");
            assert!(match_data.status == MatchStatus::Open, "Match not open");

            let caller = self.env().caller();
            let key = (match_id, caller);
            let mut stake = self.stakes.get(&key).unwrap_or(Stake {
                team,
                amount: 0,
                claimed: false,
            });
            assert!(stake.team == team, "Cannot change team");  // 防止切换队伍 / Prevent team switch
            stake.amount = stake.amount.checked_add(amount).expect("Overflow");
            self.stakes.insert(key, &stake);

            if team == Team::TeamA {
                match_data.total_stake_a = match_data.total_stake_a.checked_add(amount).expect("Overflow");
            } else {
                match_data.total_stake_b = match_data.total_stake_b.checked_add(amount).expect("Overflow");
            }
            self.matches.insert(match_id, &match_data);

            self.env().emit_event(Staked {
                match_id,
                user: caller,
                team,
                amount,
            });
        }

        // 函数: 结算比赛 / Function: Settle Match
        // 中文: 仅admin可调用，设置结果并更改状态为Settled。
        // English: Only admin can call, sets result and changes status to Settled.
        #[ink(message)]
        pub fn settle_match(&mut self, match_id: u128, result: MatchResult) {
            let mut match_data = self.matches.get(&match_id).expect("Match not found");
            assert!(match_data.admin == self.env().caller(), "Only admin");
            assert!(match_data.status == MatchStatus::Closed, "Not closed");
            assert!(result != MatchResult::None, "Invalid result");
            match_data.result = result;
            match_data.status = MatchStatus::Settled;
            self.matches.insert(match_id, &match_data);
            self.env().emit_event(MatchSettled { match_id, result });
        }

        // 函数: 领取奖金 / Function: Claim Payout
        // 中文: 用户领取结算后的奖金，使用结算算法。初学者: 这里实现防重入（通过claimed标志），计算比例并转账。
        // English: User claims payout after settlement, using the allocation algorithm. For beginners: Implements reentrancy guard via claimed flag, calculates ratios and transfers.
        #[ink(message)]
        pub fn claim_payout(&mut self, match_id: u128) {
            let caller = self.env().caller();
            let key = (match_id, caller);
            let mut stake = self.stakes.get(&key).expect("No stake");
            assert!(!stake.claimed, "Already claimed");
            let match_data = self.matches.get(&match_id).expect("Match not found");
            assert!(match_data.status == MatchStatus::Settled, "Not settled");

            let is_winner = if match_data.result == MatchResult::TeamA {
                stake.team == Team::TeamA
            } else if match_data.result == MatchResult::Draw {
                stake.team == Team::TeamA || stake.team == Team::TeamB
            } else {
                stake.team == Team::TeamB
            };

            let total_stake_team = if stake.team == Team::TeamA {
                match_data.total_stake_a
            } else if stake.team == Team::TeamB {
                match_data.total_stake_b
            } else {
                0 // Draw, total stake is 0
            };
            assert!(total_stake_team > 0, "No stakes for team");

            let user_ratio = stake.amount / total_stake_team;  // 用户比例 / User ratio
            let pool_share = if match_data.result == MatchResult::Draw {
                (match_data.pool_amount * 50) / 100  // 平分 / 50% split
            } else if is_winner {
                (match_data.pool_amount * 70) / 100
            } else {
                (match_data.pool_amount * 30) / 100
            };
            let user_pool: Balance;
            if total_stake_team == 0 {
                user_pool = 0;  // 或返回本金 / Or return principal only
            } else {
                user_pool = (stake.amount.checked_mul(pool_share).expect("Overflow") / total_stake_team);
            }
            let user_share = stake.amount.checked_add(user_pool).expect("Overflow");
            let fee = user_share.checked_mul(5).expect("Overflow") / 100;
            let payout = user_share.checked_sub(fee).expect("Underflow");

            // 转账给用户 / Transfer to user
            self.env().transfer(caller, payout).expect("Transfer failed");

            // 手续费给接收者 / Fee to receiver
            let fee_receiver = self.fee_receiver.get(&match_id);
            if let Some(receiver) = fee_receiver {
                self.env().transfer(receiver, fee).expect("Fee transfer failed");
            } else {
                // No injection, no fee receiver, perhaps keep fee in contract or zero
                // For now, transfer to caller or skip; design assumes injection, so assert
                assert!(false, "No fee receiver set");
            }

            stake.claimed = true;
            self.stakes.insert(key, &stake);

            self.env().emit_event(PayoutClaimed {
                match_id,
                user: caller,
                amount: payout,
            });
        }

        // 新函数: 提取未领取奖励 / Function: Withdraw Unclaimed
        // 中文: 仅管理员可调用，提取指定用户未领取的奖励到管理员地址（防止资金锁定）。初学者: 这是一个可选的回收机制，只在Settled后有效。
        // English: Only admin can call, withdraws unclaimed payout for a user to admin address (prevent locked funds). For beginners: This is an optional recovery mechanism, valid only after Settled.
        #[ink(message)]
        pub fn withdraw_unclaimed(&mut self, match_id: u128, user: AccountId) {
            let mut match_data = self.matches.get(&match_id).expect("Match not found");
            assert!(match_data.admin == self.env().caller(), "Only admin");
            assert!(match_data.status == MatchStatus::Settled, "Not settled");

            let key = (match_id, user);
            let mut stake = self.stakes.get(&key).expect("No stake");
            assert!(!stake.claimed, "Already claimed");

            // 计算用户份额（同claim_payout逻辑） / Calculate user share (same as claim_payout)
            let is_winner = if match_data.result == MatchResult::TeamA {
                stake.team == Team::TeamA
            } else if match_data.result == MatchResult::Draw {
                stake.team == Team::TeamA || stake.team == Team::TeamB
            } else {
                stake.team == Team::TeamB
            };

            let total_stake_team = if stake.team == Team::TeamA {
                match_data.total_stake_a
            } else if stake.team == Team::TeamB {
                match_data.total_stake_b
            } else {
                0 // Draw, total stake is 0
            };
            assert!(total_stake_team > 0, "No stakes for team");

            let user_pool: Balance;
            if total_stake_team == 0 {
                user_pool = 0;  // 或返回本金 / Or return principal only
            } else {
                user_pool = (stake.amount.checked_mul(if match_data.result == MatchResult::Draw { (match_data.pool_amount * 50) / 100 } else if is_winner { (match_data.pool_amount * 70) / 100 } else { (match_data.pool_amount * 30) / 100 }).expect("Overflow") / total_stake_team);
            }
            let user_share = stake.amount.checked_add(user_pool).expect("Overflow");
            let fee = user_share.checked_mul(5).expect("Overflow") / 100;
            let payout = user_share.checked_sub(fee).expect("Underflow");

            // 转账到管理员（而非用户） / Transfer to admin (instead of user)
            self.env().transfer(match_data.admin, payout).expect("Transfer failed");

            // 手续费仍给接收者 / Fee still to receiver
            if let Some(receiver) = self.fee_receiver.get(&match_id) {
                self.env().transfer(receiver, fee).expect("Fee transfer failed");
            }

            stake.claimed = true;  // 标记为已处理 / Mark as handled
            self.stakes.insert(key, &stake);

            // 可添加事件 / Can add event if needed
        }

        // 查看函数: 获取比赛信息 / View Function: Get Match
        // 中文: 只读函数，返回比赛详情。初学者: #[ink(message)] 但无mut，表示view。
        // English: Read-only function, returns match details. For beginners: No 'mut' means it's a view.
        #[ink(message)]
        pub fn get_match(&self, match_id: u128) -> Option<Match> {
            self.matches.get(&match_id)
        }

        // 查看函数: 获取用户投注 / View Function: Get User Stake
        #[ink(message)]
        pub fn get_user_stake(&self, match_id: u128, user: AccountId) -> Option<Stake> {
            self.stakes.get(&(match_id, user))
        }

        // 其他函数可根据需要添加 / Additional functions can be added as needed

        // Add missing function: update_match_teams (only admin, in Pending)
        // 中文: 仅admin可调用，更新队伍信息，在Pending状态。初学者: 这允许修改队伍标识。
        // English: Only admin can call, updates team info in Pending status. For beginners: Allows modifying team identifiers.
        #[ink(message)]
        pub fn update_match_teams(&mut self, match_id: u128, new_team_a: [u8; 32], new_team_b: [u8; 32]) {
            let mut match_data = self.matches.get(&match_id).expect("Match not found");
            assert!(match_data.admin == self.env().caller(), "Only admin");
            assert!(match_data.status == MatchStatus::Pending, "Can only update in Pending");
            match_data.team_a = new_team_a;
            match_data.team_b = new_team_b;
            self.matches.insert(match_id, &match_data);
            // Emit event if needed, e.g., TeamUpdated
        }

        // Add new function: emergency_withdraw (only deployer or admin, for all matches)
        // 中文: 紧急提取合约余额到指定地址，仅部署者调用。初学者: 用于极端情况回收资金。
        // English: Emergency withdraw contract balance to specified address, only by deployer. For beginners: For extreme cases to recover funds.
        #[ink(message)]
        pub fn emergency_withdraw(&mut self, to: AccountId, amount: Balance) {
            // 只允许合约部署者 / Only contract deployer
            // 假设添加一个deployer存储 / Assume adding a deployer in storage
            // 先在storage添加: deployer: AccountId,
            // 在new(): instance.deployer = Self::env().caller();

            assert!(self.deployer == self.env().caller(), "Only deployer");
            let balance = self.env().balance();
            assert!(amount <= balance, "Insufficient balance");
            self.env().transfer(to, amount).expect("Transfer failed");
        }
    }
}
