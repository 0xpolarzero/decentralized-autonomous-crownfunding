const developmentChains = ['hardhat', 'localhost'];
const VERIFICATION_BLOCK_CONFIRMATIONS = 5;

// The period of each phase in seconds
const PHASE_PERIOD = 10 * 60; // 10 minutes

module.exports = {
  developmentChains,
  VERIFICATION_BLOCK_CONFIRMATIONS,
  PHASE_PERIOD,
};
