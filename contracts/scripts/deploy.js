// ParaGoal智能合约部署脚本
// English: ParaGoal smart contract deployment script

const { ethers } = require("hardhat");

async function main() {
  console.log("开始部署ParaGoal智能合约到Paseo测试网...");
  console.log("Starting deployment of ParaGoal smart contract to Paseo testnet...");
  
  // 获取部署者账户 / Get deployer account
  const [deployer] = await ethers.getSigners();
  console.log("部署者地址 / Deployer address:", deployer.address);
  
  // 检查账户余额 / Check account balance
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("账户余额 / Account balance:", ethers.formatEther(balance), "ETH");
  
  if (balance < ethers.parseEther("0.1")) {
    console.warn("警告：账户余额较低，可能无法完成部署");
    console.warn("Warning: Low account balance, deployment might fail");
  }
  
  // 部署合约 / Deploy contract
  console.log("正在部署ParaGoalBetting合约...");
  console.log("Deploying ParaGoalBetting contract...");
  
  const ParaGoalBetting = await ethers.getContractFactory("ParaGoalBetting");
  const contract = await ParaGoalBetting.deploy();
  
  await contract.waitForDeployment();
  
  const contractAddress = await contract.getAddress();
  
  console.log("✅ 合约部署成功！");
  console.log("✅ Contract deployed successfully!");
  console.log("合约地址 / Contract address:", contractAddress);
  console.log("部署者 / Deployer:", deployer.address);
  
  // 验证内置比赛初始化 / Verify built-in matches initialization
  console.log("验证内置比赛初始化...");
  console.log("Verifying built-in matches initialization...");
  
  for (let i = 1; i <= 4; i++) {
    const match = await contract.getMatch(i);
    console.log(`比赛${i} / Match ${i}:`, {
      id: match.id.toString(),
      admin: match.admin,
      teamA: ethers.hexlify(match.teamA),
      teamB: ethers.hexlify(match.teamB),
      isBuiltIn: match.isBuiltIn,
      status: match.status
    });
  }
  
  // 输出配置信息 / Output configuration info
  console.log("\n📋 前端配置信息 / Frontend Configuration:");
  console.log("请在.env文件中设置以下变量 / Please set the following variables in .env file:");
  console.log(`VITE_PUBLIC_CONTRACT_ADDRESS=${contractAddress}`);
  console.log("VITE_PUBLIC_RPC_URL=https://testnet-passet-hub-eth-rpc.polkadot.io");
  console.log("VITE_PUBLIC_EXPLORER_URL=https://assethub-paseo.subscan.io");
  
  // 区块浏览器链接 / Block explorer link
  console.log(`\n🔗 区块浏览器 / Block Explorer: https://assethub-paseo.subscan.io/account/${contractAddress}`);
  
  // 保存部署信息到文件 / Save deployment info to file
  const deploymentInfo = {
    contractAddress: contractAddress,
    deployer: deployer.address,
    network: "paseo",
    timestamp: new Date().toISOString(),
    chainId: 1111
  };
  
  const fs = require('fs');
  fs.writeFileSync('deployment-info.json', JSON.stringify(deploymentInfo, null, 2));
  console.log("部署信息已保存到 deployment-info.json");
  console.log("Deployment info saved to deployment-info.json");
  
  console.log("\n🎉 部署完成！现在可以开始测试合约功能了。");
  console.log("🎉 Deployment complete! You can now start testing contract functionality.");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("部署失败 / Deployment failed:", error);
    process.exit(1);
  });
