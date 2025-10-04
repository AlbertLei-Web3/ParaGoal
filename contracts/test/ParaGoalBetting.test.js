// ParaGoal智能合约测试文件
// English: ParaGoal smart contract test file

const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("ParaGoalBetting", function () {
  let paraGoalBetting;
  let owner;
  let addr1;
  let addr2;
  let addrs;

  beforeEach(async function () {
    // 获取测试账户 / Get test accounts
    [owner, addr1, addr2, ...addrs] = await ethers.getSigners();

    // 部署合约 / Deploy contract
    const ParaGoalBetting = await ethers.getContractFactory("ParaGoalBetting");
    paraGoalBetting = await ParaGoalBetting.deploy();
    await paraGoalBetting.waitForDeployment();
  });

  describe("部署 / Deployment", function () {
    it("应该正确设置合约所有者 / Should set the correct owner", async function () {
      expect(await paraGoalBetting.owner()).to.equal(owner.address);
    });

    it("应该初始化内置比赛 / Should initialize built-in matches", async function () {
      // 检查4场内置比赛是否创建 / Check if 4 built-in matches are created
      for (let i = 1; i <= 4; i++) {
        const match = await paraGoalBetting.getMatch(i);
        expect(match.id).to.equal(i);
        expect(match.isBuiltIn).to.be.true;
        expect(match.admin).to.equal(owner.address);
      }
    });

    it("应该设置正确的nextMatchId / Should set correct nextMatchId", async function () {
      expect(await paraGoalBetting.nextMatchId()).to.equal(5);
    });
  });

  describe("比赛创建 / Match Creation", function () {
    it("应该允许用户创建新比赛 / Should allow users to create new matches", async function () {
      const teamA = ethers.keccak256(ethers.toUtf8Bytes("Team A"));
      const teamB = ethers.keccak256(ethers.toUtf8Bytes("Team B"));

      await expect(paraGoalBetting.connect(addr1).createMatch(teamA, teamB))
        .to.emit(paraGoalBetting, "MatchCreated")
        .withArgs(5, addr1.address, teamA, teamB, false);

      const match = await paraGoalBetting.getMatch(5);
      expect(match.admin).to.equal(addr1.address);
      expect(match.isBuiltIn).to.be.false;
    });

    it("应该防止创建无效比赛 / Should prevent creating invalid matches", async function () {
      const teamA = ethers.keccak256(ethers.toUtf8Bytes("Team A"));
      const zeroTeam = ethers.ZeroHash;

      await expect(
        paraGoalBetting.connect(addr1).createMatch(zeroTeam, teamA)
      ).to.be.revertedWith("ParaGoal: Invalid team identifiers");

      await expect(
        paraGoalBetting.connect(addr1).createMatch(teamA, teamA)
      ).to.be.revertedWith("ParaGoal: Teams cannot be the same");
    });
  });

  describe("比赛管理 / Match Management", function () {
    let matchId;

    beforeEach(async function () {
      const teamA = ethers.keccak256(ethers.toUtf8Bytes("Team A"));
      const teamB = ethers.keccak256(ethers.toUtf8Bytes("Team B"));
      
      await paraGoalBetting.connect(addr1).createMatch(teamA, teamB);
      matchId = 5;
    });

    it("应该允许管理员开启比赛 / Should allow admin to open match", async function () {
      await paraGoalBetting.connect(addr1).openMatch(matchId);
      const match = await paraGoalBetting.getMatch(matchId);
      expect(match.status).to.equal(1); // MatchStatus.Open
    });

    it("应该防止非管理员开启比赛 / Should prevent non-admin from opening match", async function () {
      await expect(
        paraGoalBetting.connect(addr2).openMatch(matchId)
      ).to.be.revertedWith("ParaGoal: Not match admin");
    });

    it("应该允许管理员关闭比赛 / Should allow admin to close match", async function () {
      await paraGoalBetting.connect(addr1).openMatch(matchId);
      await paraGoalBetting.connect(addr1).closeMatch(matchId);
      
      const match = await paraGoalBetting.getMatch(matchId);
      expect(match.status).to.equal(2); // MatchStatus.Closed
    });

    it("应该允许管理员结算比赛 / Should allow admin to settle match", async function () {
      await paraGoalBetting.connect(addr1).openMatch(matchId);
      await paraGoalBetting.connect(addr1).closeMatch(matchId);
      await paraGoalBetting.connect(addr1).settleMatch(matchId, 1); // TeamA wins
      
      const match = await paraGoalBetting.getMatch(matchId);
      expect(match.status).to.equal(3); // MatchStatus.Settled
      expect(match.result).to.equal(1); // MatchResult.TeamA
    });
  });

  describe("奖池注入 / Pool Injection", function () {
    let matchId;

    beforeEach(async function () {
      const teamA = ethers.keccak256(ethers.toUtf8Bytes("Team A"));
      const teamB = ethers.keccak256(ethers.toUtf8Bytes("Team B"));
      
      await paraGoalBetting.connect(addr1).createMatch(teamA, teamB);
      matchId = 5;
    });

    it("应该允许注入奖池 / Should allow pool injection", async function () {
      const injectionAmount = ethers.parseEther("1.0");
      
      await expect(
        paraGoalBetting.connect(addr2).injectPool(matchId, { value: injectionAmount })
      ).to.emit(paraGoalBetting, "PoolInjected")
        .withArgs(matchId, addr2.address, injectionAmount, injectionAmount, addr2.address);

      const match = await paraGoalBetting.getMatch(matchId);
      expect(match.poolAmount).to.equal(injectionAmount);
      expect(match.poolInjector).to.equal(addr2.address);
    });

    it("应该防止注入零金额 / Should prevent zero amount injection", async function () {
      await expect(
        paraGoalBetting.connect(addr2).injectPool(matchId, { value: 0 })
      ).to.be.revertedWith("ParaGoal: Must inject positive amount");
    });
  });

  describe("用户投注 / User Staking", function () {
    let matchId;

    beforeEach(async function () {
      const teamA = ethers.keccak256(ethers.toUtf8Bytes("Team A"));
      const teamB = ethers.keccak256(ethers.toUtf8Bytes("Team B"));
      
      await paraGoalBetting.connect(addr1).createMatch(teamA, teamB);
      matchId = 5;
      await paraGoalBetting.connect(addr1).openMatch(matchId);
    });

    it("应该允许用户投注 / Should allow user staking", async function () {
      const stakeAmount = ethers.parseEther("0.5");
      
      await expect(
        paraGoalBetting.connect(addr2).stake(matchId, 0, { value: stakeAmount })
      ).to.emit(paraGoalBetting, "Staked")
        .withArgs(matchId, addr2.address, 0, stakeAmount);

      const userStake = await paraGoalBetting.getUserStake(matchId, addr2.address);
      expect(userStake.amount).to.equal(stakeAmount);
      expect(userStake.team).to.equal(0);
    });

    it("应该防止在非开放状态下投注 / Should prevent staking when match is not open", async function () {
      await paraGoalBetting.connect(addr1).closeMatch(matchId);
      
      await expect(
        paraGoalBetting.connect(addr2).stake(matchId, 0, { value: ethers.parseEther("0.5") })
      ).to.be.revertedWith("ParaGoal: Match not open");
    });
  });

  describe("奖金计算 / Payout Calculation", function () {
    let matchId;

    beforeEach(async function () {
      const teamA = ethers.keccak256(ethers.toUtf8Bytes("Team A"));
      const teamB = ethers.keccak256(ethers.toUtf8Bytes("Team B"));
      
      await paraGoalBetting.connect(addr1).createMatch(teamA, teamB);
      matchId = 5;
      await paraGoalBetting.connect(addr1).openMatch(matchId);
    });

    it("应该正确计算获胜方奖金 / Should correctly calculate winner payout", async function () {
      // 注入奖池 / Inject pool
      await paraGoalBetting.connect(addr2).injectPool(matchId, { value: ethers.parseEther("10.0") });
      
      // 用户投注 / User stakes
      await paraGoalBetting.connect(addr2).stake(matchId, 0, { value: ethers.parseEther("1.0") }); // Team A
      await paraGoalBetting.connect(addrs[0]).stake(matchId, 1, { value: ethers.parseEther("2.0") }); // Team B
      
      // 结算比赛 / Settle match
      await paraGoalBetting.connect(addr1).closeMatch(matchId);
      await paraGoalBetting.connect(addr1).settleMatch(matchId, 1); // Team A wins
      
      // 计算奖金 / Calculate payout
      const payout = await paraGoalBetting.calculatePayout(matchId, addr2.address);
      
      // 验证奖金计算 / Verify payout calculation
      // 用户投注1 ETH，奖池10 ETH，Team A获胜
      // 用户应得：1 + (1/1 * 10 * 0.7) - 5%手续费
      const expectedPayout = ethers.parseEther("1.0").add(
        ethers.parseEther("7.0").mul(95).div(100)
      );
      
      expect(payout).to.be.closeTo(expectedPayout, ethers.parseEther("0.01"));
    });
  });
});
