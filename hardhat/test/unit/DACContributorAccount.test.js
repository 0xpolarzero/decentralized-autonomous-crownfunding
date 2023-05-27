const { deployments, network, ethers } = require('hardhat');
const { assert, expect } = require('chai');
const { developmentChains } = require('../../helper-hardhat-config');
const { time } = require('@nomicfoundation/hardhat-network-helpers');

!developmentChains.includes(network.name)
  ? describe.skip
  : describe('MockDACContributorAccount unit tests', function () {
      let deployer;
      let user; // owner of the contributor account
      let notUser; // not the owner
      let projectContract;
      let contributorAccountContract;

      beforeEach(async () => {
        const accounts = await ethers.getSigners();
        deployer = accounts[0];
        user = accounts[1];
        notUser = accounts[2];
        await deployments.fixture(['all']);

        const dacAggregatorContract = await ethers.getContract(
          'MockDACAggregator',
          deployer,
        );

        // Create a contributor account
        const paymentInterval = 60 * 60 * 24 * 7; // 1 week
        const txAccount = await dacAggregatorContract.createContributorAccount(
          paymentInterval,
        );
        await txAccount.wait(1);

        // Grab the contract
        const contributorAccountAddress =
          await dacAggregatorContract.getContributorAccount(notUser.address);
        contributorAccountContract = await ethers.getContractAt(
          'MockDACContributorAccount',
          contributorAccountAddress,
        );

        // Create a project
        const submitProjectArgs = {
          collaborators: [deployer.address, user.address], // collaborators
          shares: [70, 30], // shares of 70% and 30%
          name: 'Project 1', // project name
          description: 'Project 1 description', // project description
        };
        const txProject = await dacAggregatorContract.submitProject(
          ...Object.values(submitProjectArgs),
        );
        const txProjectReceipt = await txProject.wait(1);

        // Grab the contract
        const projectContractAddress =
          txProjectReceipt.events[0].args[0].projectContract;
        projectContract = await ethers.getContractAt(
          'DACProject',
          projectContractAddress,
        );
      });

      /* -------------------------------------------------------------------------- */
      /*                                 constructor                                */
      /* -------------------------------------------------------------------------- */

      describe.only('constructor', function () {
        it('Should initialize the variables with the right value', async () => {
          // getOwner
          // getCreatedAt
          // getMaxContributions
          // getLink
          // getUpkeepRegistry
          // getUpkeepRegistrar
          // getDACAggregator
          // getLastUpkeep
          // getUpkeepInterval
          // getUpkeepId
          // isUpkeepRegistered

          assert.equal(
            await contributorAccountContract.getOwner(),
            user.address,
          );
        });
      });

      /* -------------------------------------------------------------------------- */
      /*                             createContribution                             */
      /* -------------------------------------------------------------------------- */

      describe('createContribution', function () {
        // revert if not owner
        // revert if project no longer active
        // revert if create without any eth or different arg as msg.value
        // revert if already max amount of contributions
        // revert if endDate already passed
        // indeed created (check s_contributions array) and emit correct event
      });

      /* -------------------------------------------------------------------------- */
      /*                             updateContribution                             */
      /* -------------------------------------------------------------------------- */

      describe('updateContribution', function () {
        // revert if not owner
        // revert if contribution no longer active (meaning that everything was already distributed)
        /// If it's a contribution increase
        // revert if the value is not enough to cover the increase
        // successfull update (check s_contributions array) and emit correct event
        /// If it's a contribution decrease
        // revert if the amount is lower than the amount already distributed
        // successfull update (check s_contributions array), transfer the difference to the owner and emit correct event
      });

      /* -------------------------------------------------------------------------- */
      /*                             cancelContribution                             */
      /* -------------------------------------------------------------------------- */

      describe('cancelContribution', function () {
        // revert if not owner
        // revert if contribution no longer active (meaning that everything was already distributed)
        // successfull cancel (check s_contributions array), send the owner the remaining amount and emit correct event
      });

      /* -------------------------------------------------------------------------- */
      /*                           cancelAllContributions                           */
      /* -------------------------------------------------------------------------- */

      describe('cancelAllContributions', function () {
        // revert if not owner
        // withdraw the whole balance of the contract to the owner
        // successfull delete the array (check s_contributions array) and emit correct event
      });

      /* -------------------------------------------------------------------------- */
      /*                            triggerManualPayment                            */
      /* -------------------------------------------------------------------------- */

      describe('triggerManualPayment', function () {
        // revert if not owner
        // update the time of the last upkeep
        // send the correct contributions to the correct projects and emit correct event
      });

      /* -------------------------------------------------------------------------- */
      /*                              CHAINLINK UPKEEP                              */
      /* -------------------------------------------------------------------------- */

      // The following tests are very limited, as this contract is mocking the
      // upkeep interactions
      // See staging tests for more details and better stress testing

      /* -------------------------------------------------------------------------- */
      /*                               Mock functions                               */
      /* -------------------------------------------------------------------------- */

      describe('registerNewUpkeep', function () {
        // revert if not owner
        // revert if the upkeep is already registered
        // successfully registers the upkeep (check upkeepId)
        // Updates the registered variable & emit correct event
      });

      describe('cancelUpkeep', function () {
        // revert if not owner
        // set upkeep registered to false and emit correct event
      });

      describe('withdrawUpkeepFunds', function () {
        // revert if not owner
        // emit correct event
      });

      // Triggered when LINK is being sent to the contract (with `transferAndCall`)
      describe('onTokenTransfer', function () {
        // just send link with transferAndCall and check that the event is emitted
      });

      /* -------------------------------------------------------------------------- */
      /*                                 checkUpkeep                                */
      /* -------------------------------------------------------------------------- */

      describe('checkUpkeep', function () {
        /// It will return true if the interval has passed & there is at least a contribution to send
        // return false is the interval has not passed (even if there is a contribution to send)
        // return false if the interval has passed but there is no contribution to send
        // return true if the interval has passed and there is a contribution to send
        // and also return the data of the contributions to send along
      });

      /* -------------------------------------------------------------------------- */
      /*                                performUpkeep                               */
      /* -------------------------------------------------------------------------- */

      describe('performUpkeep', function () {
        // update the time of the last upkeep
        // send the correct contributions to the correct projects and emit correct event
      });

      /* -------------------------------------------------------------------------- */
      /*                         hasEnoughLinkForNextUpkeep                         */
      /* -------------------------------------------------------------------------- */

      describe('hasEnoughLinkForNextUpkeep', function () {
        // return true if the contract has enough link to pay for the next upkeep
        // return false if the contract does not have enough link to pay for the next upkeep
      });

      /* -------------------------------------------------------------------------- */
      /*                               Admin functions                              */
      /* -------------------------------------------------------------------------- */

      describe('setUpkeepInterval', function () {
        // revert if not owner
        // update the interval and emit correct event
      });

      /* -------------------------------------------------------------------------- */
      /*                                   Helpers                                  */
      /* -------------------------------------------------------------------------- */

      /**
       * @dev Create a contribution and send part of the funds
       * @param {number} amount - Amount to send during the whole time span
       * @param {number} timeSpan - Time span in seconds
       * @param {number} timeToPass - Time to pass in seconds after creating the contribution, to send the funds
       * @returns {number} - Expected amount to be sent
       * @dev e.g. Create a contribution with 1 ETH to be distributed in 1 month, pass 7 days and send it (~1/4 of the funds)
       */

      const createContributionAndTransfer = async (
        amount,
        timeSpan,
        timeToPass,
      ) => {
        // Create the contribution
        const txCreate = await contributorAccountContract
          .connect(notUser)
          .createContribution(
            projectContract.address,
            amount,
            (await time.latest()) + timeSpan,
            { value: amount },
          );
        await txCreate.wait(1);

        // Verify the contribution is there
        const contribution = (
          await contributorAccountContract.getContributions()
        )[0];
        assert.equal(
          Number(contribution.amountStored),
          amount,
          'Should have stored the right amount',
        );

        // Pass the time
        await time.increase(timeToPass);

        // Trigger the payment
        const txTransfer = await contributorAccountContract
          .connect(notUser)
          .triggerManualPayment();
        await txTransfer.wait(1);

        // Return the expected amount
        return amount / (timeSpan / timeToPass);
      };
    });
