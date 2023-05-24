const developmentChains = ['hardhat', 'localhost'];
const VERIFICATION_BLOCK_CONFIRMATIONS = 5;

// A placeholder address to add as a collaborator in tests
const PLACEHOLDER_ADDRESS = '0x1dc6312512383A6f1b4F964f60D4e6D367D3200F';

// Addresses of the LINK token, Automation registry and registrar contracts
const chainlink = {
  polygon: {
    LINK_TOKEN: '0xb0897686c545045aFc77CF20eC7A532E3120E0F1',
    REGISTRY: '0x02777053d6764996e594c3E88AF1D58D5363a2e6',
    REGISTRAR: '0xDb8e8e2ccb5C033938736aa89Fe4fa1eDfD15a1d',
  },
  mumbai: {
    LINK_TOKEN: '0x326C977E6efc84E512bB9C30f76E30c160eD06FB',
    REGISTRY: '0xE16Df59B887e3Caa439E0b29B42bA2e7976FD8b2',
    REGISTRAR: '0x57A4a13b35d25EE78e084168aBaC5ad360252467',
  },
};

module.exports = {
  developmentChains,
  VERIFICATION_BLOCK_CONFIRMATIONS,
  PLACEHOLDER_ADDRESS,
};
