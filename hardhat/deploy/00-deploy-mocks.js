const { network } = require('hardhat');
const { developmentChains, chainlink } = require('../helper-hardhat-config');

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();

  if (!developmentChains.includes(network.name)) return;

  console.log('Local network, deploying mocks...');
  // Deploy LINK token
  const linkToken = await deploy('LinkToken', {
    from: deployer,
    args: [],
    log: true,
    waitConfirmations: 1,
  });

  chainlink[network.name].LINK_TOKEN = linkToken.address;
  console.log('Mocks deployed!');
};

module.exports.tags = ['all', 'DACAggregator', 'mocks'];
