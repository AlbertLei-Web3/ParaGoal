
// ParaGoalBetting Tests
// 中文: ParaGoalBetting 测试文件 - 使用Ink! 测试框架验证合约逻辑。初学者: #[ink::test] 定义测试函数，模拟合约调用。
// English: ParaGoalBetting Test File - Uses Ink! test framework to validate logic. For beginners: #[ink::test] defines test functions, simulates contract calls.

#![cfg_attr(not(feature = "std"), no_std, no_main)]

use crate::ParaGoalBetting;  // Correct import for tests

#[ink::test]
fn test_create_match() {
    let mut contract = ParaGoalBetting::new();
    let team_a = [0u8; 32];
    let team_b = [1u8; 32];
    let match_id = contract.create_match(team_a, team_b);
    let match_data = contract.get_match(match_id).unwrap();
    assert_eq!(match_data.admin, ink::env::test::callee::<ink::env::DefaultEnvironment>());
    assert_eq!(match_data.status, MatchStatus::Pending);
    assert_eq!(match_data.is_built_in, false);
}

#[ink::test]
fn test_inject_pool() {
    let mut contract = ParaGoalBetting::new();
    let match_id = 0;  // 内置比赛 / Built-in match
    let initial_balance = 100;
    ink::env::test::set_value_transferred::<ink::env::DefaultEnvironment>(initial_balance);
    contract.inject_pool(match_id);
    let match_data = contract.get_match(match_id).unwrap();
    assert_eq!(match_data.pool_amount, initial_balance);
    assert_eq!(match_data.pool_injected_by.unwrap(), ink::env::test::callee::<ink::env::DefaultEnvironment>());
}

#[ink::test]
fn test_stake_and_settle_win() {
    let mut contract = ParaGoalBetting::new();
    let match_id = 0;
    contract.open_match(match_id);
    let stake_amount = 50;
    ink::env::test::set_value_transferred::<ink::env::DefaultEnvironment>(stake_amount);
    contract.stake(match_id, Team::TeamA);
    contract.close_match(match_id);
    contract.settle_match(match_id, MatchResult::TeamA);
    contract.claim_payout(match_id);
    // 验证claimed / Verify claimed
    let stake = contract.get_user_stake(match_id, ink::env::test::callee::<ink::env::DefaultEnvironment>()).unwrap();
    assert!(stake.claimed);
}

#[ink::test]
fn test_draw_split() {
    let mut contract = ParaGoalBetting::new();
    let match_id = 0;
    contract.inject_pool(match_id);  // 注入以设置fee_receiver
    contract.open_match(match_id);
    ink::env::test::set_value_transferred::<ink::env::DefaultEnvironment>(50);
    contract.stake(match_id, Team::TeamA);
    contract.close_match(match_id);
    contract.settle_match(match_id, MatchResult::Draw);
    contract.claim_payout(match_id);
    // 验证逻辑（可添加更多断言） / Verify logic (add more asserts as needed)
}

#[ink::test]
fn test_zero_stake() {
    let mut contract = ParaGoalBetting::new();
    let match_id = 0;
    contract.open_match(match_id);
    contract.close_match(match_id);
    contract.settle_match(match_id, MatchResult::TeamA);
    // 无投注，claim应panic或处理 / No stake, claim should panic or handle
    let panic_happened = std::panic::catch_unwind(|| {
        contract.claim_payout(match_id);
    }).is_err();
    assert!(panic_happened, "Should panic on no stake");
}

// 更多测试可添加 / More tests can be added
