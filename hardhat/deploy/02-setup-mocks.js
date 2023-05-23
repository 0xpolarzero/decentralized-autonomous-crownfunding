const { network } = require('hardhat');
const { developmentChains, mocks } = require('../helper-hardhat-config');

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();

  if (!developmentChains.includes(network.name)) return;

  // ...
};

module.exports.tags = ['all', 'DACFactory', 'mocks'];
