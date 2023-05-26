const developmentChains = ['hardhat', 'localhost'];
const VERIFICATION_BLOCK_CONFIRMATIONS = 5;

// A placeholder address to add as a collaborator in tests
const PLACEHOLDER_ADDRESS = '0x1dc6312512383A6f1b4F964f60D4e6D367D3200F';

// Addresses of the LINK token, Automation registry and registrar contracts
const chainlink = {
  polygon: {
    // The LINK token address on the Polygon network
    LINK_TOKEN: '0xb0897686c545045aFc77CF20eC7A532E3120E0F1',
    // The Automation registrar contract address on the Polygon network
    REGISTRAR: '0xDb8e8e2ccb5C033938736aa89Fe4fa1eDfD15a1d',
    // The Automation registry contract address on the Polygon network
    REGISTRY: '0x02777053d6764996e594c3E88AF1D58D5363a2e6',
    // The maximum amount of contributions for a contributor account
    MAX_CONTRIBUTIONS: 100,
    // Here MATIC / LINK is ~1/7
    NATIVE_TOKEN_LINK_RATE: Number((1 / 7).toFixed()),
    // The premium percent fee for the calculation of the price of an upkeep call
    PREMIUM_PERCENT: 70,
    // The gas limit for an upkeep call
    GAS_LIMIT: 5_000_000,
  },
  mumbai: {
    LINK_TOKEN: '0x326C977E6efc84E512bB9C30f76E30c160eD06FB',
    REGISTRAR: '0x57A4a13b35d25EE78e084168aBaC5ad360252467',
    REGISTRY: '0xE16Df59B887e3Caa439E0b29B42bA2e7976FD8b2',
    MAX_CONTRIBUTIONS: 100,
    NATIVE_TOKEN_LINK_RATE: Number((1 / 7).toFixed()),
    PREMIUM_PERCENT: 429,
    GAS_LIMIT: 5_000_000,
  },
  hardhat: {
    LINK_TOKEN: '',
    REGISTRAR: '',
    REGISTRY: '',
    MAX_CONTRIBUTIONS: 100,
    NATIVE_TOKEN_LINK_RATE: Number((1800 / 7).toFixed()), // We're using ETH instead of MATIC
    PREMIUM_PERCENT: 429, // We're just using the maximum value
    GAS_LIMIT: 5_000_000,
  },
};

module.exports = {
  developmentChains,
  VERIFICATION_BLOCK_CONFIRMATIONS,
  PLACEHOLDER_ADDRESS,
  chainlink,
};
