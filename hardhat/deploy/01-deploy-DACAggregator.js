const { network, ethers } = require('hardhat');
const { developmentChains, chainlink } = require('../helper-hardhat-config');
const { verify } = require('../utils/verify');

module.exports = async function ({ getNamedAccounts, deployments }) {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  const args = Object.values(chainlink[network.name]);

  const dacAggregator = await deploy('DACAggregator', {
    from: deployer,
    args,
    log: true,
    waitConfirmations: network.config.blockConfirmations || 1,
  });

  if (
    !developmentChains.includes(network.name) &&
    process.env.ARBISCAN_API_KEY
  ) {
    console.log('Verifying contract...');
    await verify(dacAggregator.address, args);
  }
};

module.exports.tags = ['all', 'DACAggregator', 'main'];
