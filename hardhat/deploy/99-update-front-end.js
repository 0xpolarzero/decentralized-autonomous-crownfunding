const { ethers, network } = require('hardhat');
const fs = require('fs');

const frontEndContractsFile =
  '../frontend/config/constants/networkMapping.json';
const frontEndAbiFolder = '../frontend/config/constants/abis/';

module.exports = async () => {
  if (process.env.UPDATE_FRONT_END) {
    console.log('Updating front end...');
    await updateContractAddresses();
    await updateAbi();
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
    `${frontEndAbiFolder}DACAggregator.json`,
    dacAggregator.interface.format(ethers.utils.FormatTypes.json),
  );

  const dacProject = await ethers.getContractFactory('DACProject');
  fs.writeFileSync(
    `${frontEndAbiFolder}DACProject.json`,
    dacProject.interface.format(ethers.utils.FormatTypes.json),
  );

  const dacContributorAccount = await ethers.getContractFactory(
    'DACContributorAccount',
  );
  fs.writeFileSync(
    `${frontEndAbiFolder}DACContributorAccount.json`,
    dacContributorAccount.interface.format(ethers.utils.FormatTypes.json),
  );
}

module.exports.tags = ['all', 'main', 'frontend'];
