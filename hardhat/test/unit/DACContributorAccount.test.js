const { deployments, network, ethers } = require('hardhat');
const { assert, expect } = require('chai');
const { developmentChains, chainlink } = require('../../helper-hardhat-config');
const { time } = require('@nomicfoundation/hardhat-network-helpers');

!developmentChains.includes(network.name)
  ? describe.skip
  : describe.only('MockDACContributorAccount unit tests', function () {
      let deployer;
      let user; // owner of the contributor account
      let notUser; // not the owner
      let dacAggregatorContract;
      let projectContract;
      let contributorAccountContract;
      let creationTxReceipt;
      let paymentInterval = 60 * 60 * 24 * 7; // 1 week

      beforeEach(async () => {
        const accounts = await ethers.getSigners();
        deployer = accounts[0];
        user = accounts[1];
        notUser = accounts[2];
        await deployments.fixture(['all']);

        dacAggregatorContract = await ethers.getContract(
          'MockDACAggregator',
          deployer,
        );

        // Create a contributor account
        const txAccount = await dacAggregatorContract
          .connect(user)
          .createContributorAccount(paymentInterval);
        creationTxReceipt = await txAccount.wait(1);

        // Grab the contract
        const contributorAccountAddress =
          await dacAggregatorContract.getContributorAccount(user.address);
        contributorAccountContract = await ethers.getContractAt(
          'MockDACContributorAccount',
          contributorAccountAddress,
          user,
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

      describe('constructor', function () {
        it('Should initialize the variables with the right value', async () => {
          /// Immutable variables
          assert.equal(
            await contributorAccountContract.getOwner(),
            user.address,
            'Should set the owner to the user address',
          );
          assert.equal(
            Number(await contributorAccountContract.getCreatedAt()),
            (await creationTxReceipt.events[0].getBlock()).timestamp,
            'Should set the createdAt to the block timestamp',
          );
          assert.equal(
            await contributorAccountContract.getMaxContributions(),
            chainlink[network.name].MAX_CONTRIBUTIONS,
            'Should set the maxContributions to the expected max contributions',
          );
          assert.equal(
            await contributorAccountContract.getDACAggregator(),
            dacAggregatorContract.address,
            'Should set the DACAggregator to the DACAggregator address',
          );
          assert.equal(
            await contributorAccountContract.getLink(),
            chainlink[network.name].LINK_TOKEN,
            'Should set the LINK token to the LINK token address',
          );
          assert.equal(
            await contributorAccountContract.getUpkeepRegistry(),
            chainlink[network.name].REGISTRY,
            'Should set the upkeepRegistry to the registry address',
          );
          assert.equal(
            await contributorAccountContract.getUpkeepRegistrar(),
            chainlink[network.name].REGISTRAR,
            'Should set the upkeepRegistrar to the registrar address',
          );

          /// Upkeep
          assert.equal(
            Number(await contributorAccountContract.getLastUpkeep()),
            (await creationTxReceipt.events[0].getBlock()).timestamp,
            'Should set the lastUpkeep to the creation block timestamp',
          );
          assert.equal(
            Number(await contributorAccountContract.getUpkeepInterval()),
            paymentInterval,
            'Should set the upkeepInterval to the paymentInterval',
          );
          assert.equal(
            Number(await contributorAccountContract.getUpkeepId()),
            1,
            'Should set the upkeepId to 1',
          );
          assert.equal(
            await contributorAccountContract.isUpkeepRegistered(),
            true,
            'Should set the isUpkeepRegistered to true',
          );
        });
      });

      /* -------------------------------------------------------------------------- */
      /*                             createContribution                             */
      /* -------------------------------------------------------------------------- */

      describe('createContribution', function () {
        it('Should revert if not owner', async () => {
          await expect(
            contributorAccountContract
              .connect(notUser)
              .createContribution(
                projectContract.address,
                ethers.utils.parseEther('1'),
                inOneMonth(),
                { value: ethers.utils.parseEther('1') },
              ),
          ).to.be.revertedWith('DACContributorAccount__NOT_OWNER()');
        });

        it('Should revert if project no longer active', async () => {
          // Just pass more than 30 days so the project is no longer active
          await time.increase(60 * 60 * 24 * 31); // 31 days
          await expect(
            contributorAccountContract.createContribution(
              projectContract.address,
              ethers.utils.parseEther('1'),
              inOneMonth(),
              { value: ethers.utils.parseEther('1') },
            ),
          ).to.be.revertedWith('DACContributorAccount__PROJECT_NOT_ACTIVE()');
        });

        it('Should revert if the value sent along is incorrect (null or different than parameter)', async () => {
          // Value mismatch
          await expect(
            contributorAccountContract.createContribution(
              projectContract.address,
              ethers.utils.parseEther('1'),
              inOneMonth(),
              { value: ethers.utils.parseEther('2') },
            ),
          ).to.be.revertedWith('DACContributorAccount__INCORRECT_AMOUNT()');

          // No value sent
          await expect(
            contributorAccountContract.createContribution(
              projectContract.address,
              ethers.utils.parseEther('1'),
              inOneMonth(),
            ),
          ).to.be.revertedWith('DACContributorAccount__INCORRECT_AMOUNT()');
        });

        it('Should revert if the number of contributions has already reached the max', async () => {
          // Create the max amount of contributions
          for (
            let i = 0;
            i < chainlink[network.name].MAX_CONTRIBUTIONS + 1;
            i++
          ) {
            await contributorAccountContract.createContribution(
              projectContract.address,
              ethers.utils.parseEther('1'),
              inOneMonth(),
              { value: ethers.utils.parseEther('1') },
            );
          }

          // Try to create another contribution
          await expect(
            contributorAccountContract.createContribution(
              projectContract.address,
              ethers.utils.parseEther('1'),
              inOneMonth(),
              { value: ethers.utils.parseEther('1') },
            ),
          ).to.be.revertedWith(
            'DACContributorAccount__TOO_MANY_CONTRIBUTIONS()',
          );
        });

        it('Should revert if the chosen endDate is already passed', async () => {
          await expect(
            contributorAccountContract.createContribution(
              projectContract.address,
              ethers.utils.parseEther('1'),
              (await time.latest()) - 1,
              { value: ethers.utils.parseEther('1') },
            ),
          ).to.be.revertedWith('DACContributorAccount__INVALID_TIMESTAMP()');
        });

        it('Should successfully create a contribution and emit the correct event', async () => {
          const endDate = await inOneMonth();
          const tx = await contributorAccountContract.createContribution(
            projectContract.address,
            ethers.utils.parseEther('1'),
            endDate,
            { value: ethers.utils.parseEther('1') },
          );
          const txReceipt = await tx.wait(1);

          // Check the event
          const event = txReceipt.events?.find(
            (e) => e.event === 'DACContributorAccount__ContributionCreated',
          );

          assert.equal(
            event.args.projectContract,
            projectContract.address,
            'Should emit the correct project contract address',
          );
          assert.equal(
            Number(event.args.amount),
            ethers.utils.parseEther('1'),
            'Should emit the correct contribution amount',
          );
          assert.equal(
            Number(event.args.endDate),
            endDate,
            'Should emit the correct end date',
          );

          // Check the contribution
          const contribution = (
            await contributorAccountContract.getContributions()
          )[0];

          assert.equal(
            contribution.projectContract,
            projectContract.address,
            'Should set the correct project contract address',
          );
          assert.equal(
            Number(contribution.amountStored),
            ethers.utils.parseEther('1'),
            'Should set the correct stored amount',
          );
          assert.equal(
            Number(contribution.amountDistributed),
            0,
            'Should set the correct distributed amount',
          );
          assert.equal(
            Number(contribution.startedAt),
            (await txReceipt.events[0].getBlock()).timestamp,
            'Should set the correct start date',
          );
          assert.equal(
            Number(contribution.endsAt),
            endDate,
            'Should set the correct end date',
          );
        });
      });

      /* -------------------------------------------------------------------------- */
      /*                             updateContribution                             */
      /* -------------------------------------------------------------------------- */

      describe('updateContribution', function () {
        beforeEach(async () => {
          // Create a contribution
          await contributorAccountContract.createContribution(
            projectContract.address,
            ethers.utils.parseEther('1'),
            inOneMonth(),
            { value: ethers.utils.parseEther('1') },
          );
        });

        it('Should revert if not owner', async () => {
          await expect(
            contributorAccountContract
              .connect(notUser)
              .updateContribution(0, ethers.utils.parseEther('2')),
          ).to.be.revertedWith('DACContributorAccount__NOT_OWNER()');
        });

        it('Should revert if the contribution was already fully distributed)', async () => {
          await time.increase(60 * 60 * 24 * 20); // 20 days
          // Ping the project so it does not become inactive
          await dacAggregatorContract.pingProject(projectContract.address);
          await time.increase(60 * 60 * 24 * 11); // 11 days
          // Send the entire contribution
          await contributorAccountContract.triggerManualPayment();

          await expect(
            contributorAccountContract.updateContribution(
              0,
              ethers.utils.parseEther('2'),
              { value: ethers.utils.parseEther('1') },
            ),
          ).to.be.revertedWith(
            'DACContributorAccount__CONTRIBUTION_ALREADY_DISTRIBUTED()',
          );
        });

        /// If it's a contribution increase
        it('Should revert if the value is not enough to cover the increase', async () => {
          await expect(
            contributorAccountContract.updateContribution(
              0,
              ethers.utils.parseEther('2'),
              { value: ethers.utils.parseEther('0.5') },
            ),
          ).to.be.revertedWith('DACContributorAccount__INCORRECT_AMOUNT()');
        });

        it('Should successfully update the contribution and emit the correct event', async () => {
          const tx = await contributorAccountContract.updateContribution(
            0,
            ethers.utils.parseEther('2'),
            { value: ethers.utils.parseEther('1') },
          );
          const txReceipt = await tx.wait(1);

          // Check the event
          const event = txReceipt.events?.find(
            (e) => e.event === 'DACContributorAccount__ContributionUpdated',
          );

          assert.equal(
            event.args.projectContract,
            projectContract.address,
            'Should emit the correct project contract address',
          );
          assert.equal(
            Number(event.args.amount),
            ethers.utils.parseEther('2'),
            'Should emit the correct contribution amount',
          );

          // Check the contribution
          const contribution = (
            await contributorAccountContract.getContributions()
          )[0];

          assert.equal(
            contribution.projectContract,
            projectContract.address,
            'Should set the correct project contract address',
          );
          assert.equal(
            Number(contribution.amountStored),
            ethers.utils.parseEther('2'),
            'Should set the correct stored amount',
          );
          assert.equal(
            Number(contribution.amountDistributed),
            0,
            'Should set the correct distributed amount',
          );
        });

        /// If it's a contribution decrease
        it('Should revert if the amount is lower than the amount already distributed', async () => {
          await time.increase(60 * 60 * 24 * 14); // 14 days
          // Send part of the contribution
          await contributorAccountContract.triggerManualPayment();

          // Find how much was already distributed
          const contribution = (
            await contributorAccountContract.getContributions()
          )[0];

          await expect(
            contributorAccountContract.updateContribution(
              0,
              contribution.amountDistributed.sub(ethers.BigNumber.from('1')),
            ),
          ).to.be.revertedWith('DACContributorAccount__INCORRECT_AMOUNT()');
        });

        it('Should successfully update the contribution, transfer the difference and emit the correct event', async () => {
          await time.increase(60 * 60 * 24 * 14); // 14 days
          // Send part of the contribution
          const txPayment =
            await contributorAccountContract.triggerManualPayment();
          await txPayment.wait(1);
          // Get the balance before the update
          const initialBalance = await ethers.provider.getBalance(
            await user.getAddress(),
          );

          // Find how much was already distributed
          const contribution = (
            await contributorAccountContract.getContributions()
          )[0];
          // Find how much is left to distribute
          const amountLeft = contribution.amountStored.sub(
            contribution.amountDistributed,
          );

          const txUpdate = await contributorAccountContract.updateContribution(
            0,
            contribution.amountDistributed,
          );
          const txReceipt = await txUpdate.wait(1);

          // Check the event
          const event = txReceipt.events?.find(
            (e) => e.event === 'DACContributorAccount__ContributionUpdated',
          );

          assert.equal(
            event.args.projectContract,
            projectContract.address,
            'Should emit the correct project contract address',
          );
          assert.equal(
            Number(event.args.amount),
            contribution.amountDistributed,
            'Should emit the correct contribution amount',
          );

          // Check the contribution
          const updatedContribution = (
            await contributorAccountContract.getContributions()
          )[0];

          assert.equal(
            updatedContribution.projectContract,
            projectContract.address,
            'Should set the correct project contract address',
          );
          assert.deepEqual(
            updatedContribution.amountStored,
            contribution.amountDistributed,
            'Should set the correct stored amount',
          );
          assert.deepEqual(
            updatedContribution.amountDistributed,
            contribution.amountDistributed,
            'Should set the correct distributed amount',
          );

          // Check the balance
          const gasUsed = txReceipt.cumulativeGasUsed.mul(
            txReceipt.effectiveGasPrice,
          );

          assert.deepEqual(
            await ethers.provider.getBalance(await user.getAddress()),
            initialBalance.add(amountLeft).sub(gasUsed),
            'Should transfer the difference to the user',
          );
        });
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
        // if during the contribution period
        // if after the contribution period
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

      /**
       * @dev Get the timestamp of one month from now
       * @returns {number} - Timestamp of one month from now
       */

      const inOneMonth = async () => {
        return (await time.latest()) + 30 * 24 * 60 * 60;
      };
    });
