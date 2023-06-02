const { run } = require('hardhat');
const { chainlink } = require('../helper-hardhat-config');

const CONTRACT_ADDRESS = '0x397589d60EB075CD4EbC702004A6e562AEFc92Db';

const ARGS_CONTRIBUTOR_ACCOUNT = [
  '0xAD285b5dF24BDE77A8391924569AF2AD2D4eE4A7', //  owner address
  chainlink[network.name].LINK_TOKEN, // LINK token address
  chainlink[network.name].REGISTRAR, // Upkeep registrar address
  chainlink[network.name].REGISTRY, // Upkeep registry address
  60, // Upkeep interval
  chainlink[network.name].MAX_CONTRIBUTIONS, // Max contributions
  chainlink[network.name].GAS_LIMIT, // Upkeep gas limit
];

const verify = async () => {
  console.log('Verifying contract...');
  try {
    await run('verify:verify', {
      address: CONTRACT_ADDRESS,
      constructorArguments: ARGS_CONTRIBUTOR_ACCOUNT,
    });
  } catch (e) {
    if (e.message.toLowerCase().includes('already verified')) {
      console.log('Contract already verified!');
    } else {
      console.log(e);
    }
  }
};

verify()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
