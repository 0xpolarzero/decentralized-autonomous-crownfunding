const { ethers } = require('hardhat');
const { format } = require('util');
const fs = require('fs');
const { developmentChains } = require('../helper-hardhat-config');

const frontEndContractsFile =
  '../frontend/config/constants/network-mapping.json';
const frontEndAbiFolder = '../frontend/config/constants/abis/';

module.exports = async () => {
  if (
    process.env.UPDATE_FRONT_END &&
    !developmentChains.includes(network.name)
  ) {
    console.log('Updating front end...');
    await updateContractAddresses();
    // await updateAbi();
  }
};

async function updateContractAddresses() {
  const dacAggregator = await ethers.getContract('DACAggregator');
  const chainId = network.config.chainId;

  const contractAddresses = JSON.parse(
    fs.readFileSync(frontEndContractsFile, 'utf8'),
  );
  if (chainId in contractAddresses) {
    if (
      !contractAddresses[chainId]['DACAggregator'].includes(
        dacAggregator.address,
      )
    ) {
      contractAddresses[chainId]['DACAggregator'].push(dacAggregator.address);
    }
  } else {
    contractAddresses[chainId] = {
      DACAggregator: [dacAggregator.address],
    };
  }

  fs.writeFileSync(frontEndContractsFile, JSON.stringify(contractAddresses));

  console.log('Front end updated!');
}

async function updateAbi() {
  const dacAggregator = await ethers.getContract('DACAggregator');
  fs.writeFileSync(
    `${frontEndAbiFolder}DACAggregator.ts`,
    format(
      'export const DACAggregatorAbi = %s as const',
      JSON.stringify(
        JSON.parse(
          dacAggregator.interface.format(ethers.utils.FormatTypes.json),
        ),
        null,
        2,
      ),
    ),
  );

  const dacProject = await ethers.getContractFactory('DACProject');
  fs.writeFileSync(
    `${frontEndAbiFolder}DACProject.ts`,
    format(
      'export const DACProjectAbi = %s as const',
      JSON.stringify(
        JSON.parse(dacProject.interface.format(ethers.utils.FormatTypes.json)),
        null,
        2,
      ),
    ),
  );

  const dacContributorAccount = await ethers.getContractFactory(
    'DACContributorAccount',
  );
  fs.writeFileSync(
    `${frontEndAbiFolder}DACContributorAccount.ts`,
    format(
      'export const DACContributorAccountAbi = %s as const',
      JSON.stringify(
        JSON.parse(
          dacContributorAccount.interface.format(ethers.utils.FormatTypes.json),
        ),
        null,
        2,
      ),
    ),
  );
}

module.exports.tags = ['all', 'main', 'frontend'];
