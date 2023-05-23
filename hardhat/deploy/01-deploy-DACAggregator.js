const { network, ethers } = require('hardhat');
const { developmentChains, PHASE_PERIOD } = require('../helper-hardhat-config');
const { verify } = require('../utils/verify');

module.exports = async function ({ getNamedAccounts, deployments }) {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  const args = [PHASE_PERIOD];

  const dacFactory = await deploy('DACFactory', {
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
    await verify(dacFactory.address, args);
  }
};

module.exports.tags = ['all', 'DACFactory', 'main'];
