const { deployments, network, ethers } = require('hardhat');
const { assert, expect } = require('chai');
const { developmentChains, chainlink } = require('../../helper-hardhat-config');
const { time } = require('@nomicfoundation/hardhat-network-helpers');

!developmentChains.includes(network.name)
  ? describe.skip
  : describe('MockDACContributorAccount unit tests', function () {
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

      // describe('cancelContribution', function () {
      //   it('Should revert if not owner', async () => {
      //     await expect(
      //       contributorAccountContract.connect(notUser).cancelContribution(0),
      //     ).to.be.revertedWith('DACContributorAccount__NOT_OWNER()');
      //   });
      //   // revert if contribution no longer active (meaning that everything was already distributed)
      //   it('Should revert if the contribution was already fully distributed', async () => {
      //   // successfull cancel (check s_contributions array), send the owner the remaining amount and emit correct event
      // });

      /* -------------------------------------------------------------------------- */
      /*                           cancelAllContributions                           */
      /* -------------------------------------------------------------------------- */

      describe('cancelAllContributions', function () {
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
              .cancelAllContributions(),
          ).to.be.revertedWith('DACContributorAccount__NOT_OWNER()');
        });

        it('Should successfully cancel all contributions, send the owner the remaining contract balance and emit the correct event', async () => {
          // Get the initial balances
          const initialUserBalance = await ethers.provider.getBalance(
            await user.getAddress(),
          );
          const initialContractBalance = await ethers.provider.getBalance(
            contributorAccountContract.address,
          );
          // Get the initial contributions
          const initialContributions =
            await contributorAccountContract.getContributions();

          // Cancel all contributions
          const txCancel =
            await contributorAccountContract.cancelAllContributions();
          const txReceipt = await txCancel.wait(1);

          // Check the event
          const event = txReceipt.events?.find(
            (e) =>
              e.event === 'DACContributorAccount__AllContributionsCanceled',
          );

          assert.deepEqual(
            event.args.contributions,
            initialContributions,
            'Should emit the correct canceled contributions',
          );
          assert.deepEqual(
            event.args.amount,
            initialContractBalance,
            'Should emit the correct withdrawn contract balance',
          );

          // Check the balances
          const gasUsed = txReceipt.cumulativeGasUsed.mul(
            txReceipt.effectiveGasPrice,
          );

          assert.deepEqual(
            await ethers.provider.getBalance(await user.getAddress()),
            initialUserBalance.add(initialContractBalance).sub(gasUsed),
            'Should transfer the difference to the user',
          );
          assert.equal(
            Number(
              await ethers.provider.getBalance(
                contributorAccountContract.address,
              ),
            ),
            0,
            'Should withdraw the whole balance of the contract',
          );

          // Check the contributions
          const contributions =
            await contributorAccountContract.getContributions();

          assert.deepEqual(
            contributions,
            [],
            'Should delete the contributions array',
          );
        });
      });

      /* -------------------------------------------------------------------------- */
      /*                            triggerManualPayment                            */
      /* -------------------------------------------------------------------------- */

      describe('triggerManualPayment', function () {
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
            contributorAccountContract.connect(notUser).triggerManualPayment(),
          ).to.be.revertedWith('DACContributorAccount__NOT_OWNER()');
        });

        it('Should revert if there are no contributions to distribute', async () => {
          /// Complete the contribution
          // Pass 20 days
          await time.increase(20 * 24 * 60 * 60);
          // Ping the project so it won't become inactive
          await dacAggregatorContract.pingProject(projectContract.address);
          // Pass 11 days
          await time.increase(11 * 24 * 60 * 60);
          // Distribute it fully
          const txPayment =
            await contributorAccountContract.triggerManualPayment();
          await txPayment.wait(1);

          // Try to trigger the manual payment
          await expect(
            contributorAccountContract.triggerManualPayment(),
          ).to.be.revertedWith(
            'DACContributorAccount__NO_CONTRIBUTION_TO_SEND()',
          );
        });

        it('Should successfully update the time of the last upkeep', async () => {
          // Trigger the manual payment
          const txTrigger =
            await contributorAccountContract.triggerManualPayment();
          const txReceipt = await txTrigger.wait(1);

          assert.equal(
            Number(await contributorAccountContract.getLastUpkeep()),
            (await txReceipt.events[0].getBlock()).timestamp,
            'Should update the time of the last upkeep',
          );
        });

        it('Should successfully send the correct contributions to the correct projects and emit the correct event', async () => {
          const contributionAtStart = (
            await contributorAccountContract.getContributions()
          )[0];

          /// During the contribution period
          // Pass 20 days
          await time.increase(20 * 24 * 60 * 60);
          // Ping the project so it won't become inactive
          await dacAggregatorContract.pingProject(projectContract.address);

          // Send the contribution
          const txTrigger =
            await contributorAccountContract.triggerManualPayment();
          const txReceipt = await txTrigger.wait(1);

          const contributionDuringPeriod = (
            await contributorAccountContract.getContributions()
          )[0];

          // Check the distribution
          assert.deepEqual(
            contributionDuringPeriod.amountDistributed,
            await calculateContributionAt(
              contributionAtStart,
              await (
                await txReceipt.events[0].getBlock()
              ).timestamp,
            ),
            'Should send the correct amount during the contribution period',
          );
          // Check the balance of the project
          assert.deepEqual(
            await ethers.provider.getBalance(projectContract.address),
            contributionDuringPeriod.amountDistributed,
            'Should send the amountDistributed to the project during the contribution period',
          );
          // Check the contract balance
          assert.deepEqual(
            await ethers.provider.getBalance(
              contributorAccountContract.address,
            ),
            contributionDuringPeriod.amountStored.sub(
              contributionDuringPeriod.amountDistributed,
            ),
            'Should remove the amountDistributed from the account contract during the contribution period',
          );
          // Check the event
          const eventDuringPeriod = txReceipt.events?.find(
            (e) => e.event === 'DACContributorAccount__ContributionsTransfered',
          );

          assert.deepEqual(
            eventDuringPeriod.args[0][0].projectContract,
            projectContract.address,
            'Should emit the correct project contract',
          );
          assert.deepEqual(
            eventDuringPeriod.args[0][0].amount,
            contributionDuringPeriod.amountDistributed,
            'Should emit the correct amount distributed',
          );

          // Pass time till the end of the contribution period (11 days)
          await time.increase(11 * 24 * 60 * 60);

          // Send the contribution
          const txTrigger2 =
            await contributorAccountContract.triggerManualPayment();
          const txReceipt2 = await txTrigger2.wait(1);

          const contributionAfterPeriod = (
            await contributorAccountContract.getContributions()
          )[0];

          // Check the distribution
          assert.deepEqual(
            contributionAfterPeriod.amountDistributed,
            await calculateContributionAt(
              contributionAtStart,
              await (
                await txReceipt2.events[0].getBlock()
              ).timestamp,
            ),
            'Should send the correct amount after the contribution period',
          );
          // It should have distributed everything
          assert.deepEqual(
            contributionAfterPeriod.amountDistributed,
            contributionAfterPeriod.amountStored,
            'Should have sent all the stored amount after the contribution period',
          );
          // Check the balance of the project
          assert.deepEqual(
            await ethers.provider.getBalance(projectContract.address),
            contributionAfterPeriod.amountDistributed,
            'Should send the amountDistributed to the project during the contribution period',
          );
          // Check the contract balance
          assert.deepEqual(
            await ethers.provider.getBalance(
              contributorAccountContract.address,
            ),
            contributionAfterPeriod.amountStored.sub(
              contributionAfterPeriod.amountDistributed,
            ),
            'Should remove the amountDistributed from the account contract during the contribution period',
          );
          // Check the event
          const eventAfterPeriod = txReceipt2.events?.find(
            (e) => e.event === 'DACContributorAccount__ContributionsTransfered',
          );

          assert.deepEqual(
            eventAfterPeriod.args[0][0].projectContract,
            projectContract.address,
            'Should emit the correct project contract',
          );
          assert.deepEqual(
            eventAfterPeriod.args[0][0].amount,
            contributionAfterPeriod.amountDistributed.sub(
              contributionDuringPeriod.amountDistributed,
            ),
            'Should emit the correct amount distributed',
          );
        });
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

      describe('Mock functions', function () {
        describe('registerNewUpkeep', function () {
          beforeEach(async () => {
            // We need to cancel the upkeep that was registered in the constructor
            // to correctly test the `registerNewUpkeep` function
            const tx = await contributorAccountContract.cancelUpkeep();
            await tx.wait(1);
          });

          it('Should revert if not owner', async () => {
            await expect(
              contributorAccountContract.connect(notUser).registerNewUpkeep(),
            ).to.be.revertedWith('DACContributorAccount__NOT_OWNER()');
          });

          it('Should revert if the upkeep is already registered', async () => {
            const tx = await contributorAccountContract.registerNewUpkeep();
            await tx.wait(1);

            await expect(
              contributorAccountContract.registerNewUpkeep(),
            ).to.be.revertedWith(
              'DACContributorAccount__UPKEEP_ALREADY_REGISTERED()',
            );
          });

          it('Should successfully register the upkeep', async () => {
            assert.equal(
              await contributorAccountContract.getUpkeepId(),
              1, // it's actually been set to 1 in the constructor, but using the same logic
              'Should have the correct upkeepId',
            );
          });

          it('Should set the upkeep as registered and emit the correct event', async () => {
            assert.equal(
              await contributorAccountContract.isUpkeepRegistered(),
              false,
              'Should not be registered initially',
            );

            const tx = await contributorAccountContract.registerNewUpkeep();
            const txReceipt = await tx.wait(1);

            assert.equal(
              await contributorAccountContract.isUpkeepRegistered(),
              true,
              'Should set the upkeep as registered',
            );

            const event = txReceipt.events?.find(
              (e) => e.event === 'DACContributorAccount__UpkeepRegistered',
            );

            assert.equal(
              event.args.upkeepId,
              1,
              'Should emit the correct upkeepId',
            );
            assert.equal(
              Number(event.args.interval),
              paymentInterval,
              'Should emit the correct upkeep interval',
            );
          });
        });

        describe('cancelUpkeep', function () {
          it('Should revert if not owner', async () => {
            await expect(
              contributorAccountContract.connect(notUser).cancelUpkeep(),
            ).to.be.revertedWith('DACContributorAccount__NOT_OWNER()');
          });

          it('Should revert if the upkeep is not registered', async () => {
            const tx = await contributorAccountContract.cancelUpkeep();
            await tx.wait(1);

            await expect(
              contributorAccountContract.cancelUpkeep(),
            ).to.be.revertedWith(
              'DACContributorAccount__UPKEEP_NOT_REGISTERED()',
            );
          });

          it('Should successfully cancel the upkeep, set is to unregistered and emit the correct event', async () => {
            const tx = await contributorAccountContract.cancelUpkeep();
            const txReceipt = await tx.wait(1);

            assert.equal(
              await contributorAccountContract.isUpkeepRegistered(),
              false,
              'Should set the upkeep as unregistered',
            );

            const event = txReceipt.events?.find(
              (e) => e.event === 'DACContributorAccount__UpkeepCanceled',
            );

            assert.equal(
              event.args.upkeepId,
              1,
              'Should emit the correct upkeepId',
            );
          });

          it('Should allow to register a new upkeep', async () => {
            const tx = await contributorAccountContract.cancelUpkeep();
            await tx.wait(1);

            assert.equal(
              await contributorAccountContract.isUpkeepRegistered(),
              false,
              'Should set the upkeep as unregistered',
            );

            const tx2 = await contributorAccountContract.registerNewUpkeep();
            await tx2.wait(1);

            assert.equal(
              await contributorAccountContract.isUpkeepRegistered(),
              true,
              'Should set the upkeep as registered',
            );
          });
        });

        describe('withdrawUpkeepFunds', function () {
          it('Should revert if not owner', async () => {
            await expect(
              contributorAccountContract.connect(notUser).withdrawUpkeepFunds(),
            ).to.be.revertedWith('DACContributorAccount__NOT_OWNER()');
          });

          it('Should emit the correct event', async () => {
            const tx = await contributorAccountContract.withdrawUpkeepFunds();
            const txReceipt = await tx.wait(1);

            const event = txReceipt.events?.find(
              (e) => e.event === 'DACContributorAccount__UpkeepFundsWithdrawn',
            );

            assert.equal(
              Number(event.args.upkeepId),
              1,
              'Should emit the correct upkeep id',
            );
          });
        });
      });

      /* -------------------------------------------------------------------------- */
      /*                                 checkUpkeep                                */
      /* -------------------------------------------------------------------------- */

      describe('checkUpkeep', function () {
        /// It will return true only if the interval has passed && there is at least a contribution to send
        it('Should return false if there is no contribution to send', async () => {
          // It should initially return false as there is no contribution to send
          // it will return an array with the following values:
          // [bool upkeepNeeded, bytes memory performData]
          assert.equal(
            (await contributorAccountContract.checkUpkeep('0x'))[0],
            false,
            'Should return false initially',
          );

          // Pass some time so the interval condition is met
          await time.increase(paymentInterval + 1);

          // It should still return false as there is no contribution to send
          assert.equal(
            (await contributorAccountContract.checkUpkeep('0x'))[0],
            false,
            'Should return false as there is no contribution to send',
          );
        });

        it('Should return false if the interval has not passed', async () => {
          // Create a contribution
          await contributorAccountContract.createContribution(
            projectContract.address,
            ethers.utils.parseEther('1'),
            inOneMonth(),
            { value: ethers.utils.parseEther('1') },
          );

          // It should return false as the interval has not passed
          assert.equal(
            (await contributorAccountContract.checkUpkeep('0x'))[0],
            false,
            'Should return false as the interval has not passed',
          );
        });

        it('Should return true if the interval has passed and there is at least a contribution to send', async () => {
          // Create a contribution
          await contributorAccountContract.createContribution(
            projectContract.address,
            ethers.utils.parseEther('1'),
            inOneMonth(),
            { value: ethers.utils.parseEther('1') },
          );
          // Pass some time so the interval condition is met
          await time.increase(paymentInterval + 1);

          // It should return true as the interval has passed and there is a contribution to send
          assert.equal(
            (await contributorAccountContract.checkUpkeep('0x'))[0],
            true,
            'Should return true as the interval has passed and there is a contribution to send',
          );
        });

        it('Should return the correct data of the contributions to send', async () => {
          // Create a contribution
          await contributorAccountContract.createContribution(
            projectContract.address,
            ethers.utils.parseEther('1'),
            inOneMonth(),
            { value: ethers.utils.parseEther('1') },
          );
          // Pass some time so the interval condition is met
          await time.increase(paymentInterval + 1);

          // Calculate how much will be distributed
          const amountToDistribute = await calculateContributionAt(
            (
              await contributorAccountContract.getContributions()
            )[0],
            await time.latest(),
          );

          // It should return the correct data of the contributions to send
          const performData = (
            await contributorAccountContract.checkUpkeep('0x')
          )[1];
          // Decode it
          const decodedPerformData = ethers.utils.defaultAbiCoder.decode(
            ['tuple(address,uint256,uint256)[]'],
            performData,
          );

          // Check the decoded data
          assert.equal(
            decodedPerformData[0][0][0],
            projectContract.address,
            'Should return the correct project address',
          );
          assert.deepEqual(
            decodedPerformData[0][0][1],
            amountToDistribute,
            'Should return the correct amount to send to the project',
          );
          assert.equal(
            Number(decodedPerformData[0][0][2]),
            0,
            'Should return the correct index in the original contributions array',
          );
        });
      });

      /* -------------------------------------------------------------------------- */
      /*                                performUpkeep                               */
      /* -------------------------------------------------------------------------- */

      describe('performUpkeep', function () {
        it('Should send the correct contributions, update the last upkeep time and emit the correct event', async () => {
          // Create a contribution
          await contributorAccountContract.createContribution(
            projectContract.address,
            ethers.utils.parseEther('1'),
            inOneMonth(),
            { value: ethers.utils.parseEther('1') },
          );
          // Pass some time
          await time.increase(paymentInterval + 1);

          // Calculate how much will be distributed
          const amountToDistribute = await calculateContributionAt(
            (
              await contributorAccountContract.getContributions()
            )[0],
            await time.latest(),
          );
          // Get the data to pass to the performUpkeep function
          const performData = (
            await contributorAccountContract.checkUpkeep('0x')
          )[1];

          // Prepare the listener
          const listener = new Promise((resolve, reject) => {
            contributorAccountContract.on(
              'DACContributorAccount__ContributionsTransfered',
              (contributions) => {
                try {
                  resolve({ ...contributions[0] });
                } catch (err) {
                  reject(err);
                }
              },
            );
          });

          // Perform the upkeep
          const tx = await contributorAccountContract.performUpkeep(
            performData,
          );
          const txReceipt = await tx.wait(1);

          // Check that the event has been emitted correctly
          const event = await listener;
          assert.equal(
            event.projectContract,
            projectContract.address,
            'Should emit the correct project address',
          );
          assert.deepEqual(
            event.amount,
            amountToDistribute,
            'Should emit the correct amount sent to the project',
          );
          assert.equal(
            Number(event.index),
            0,
            'Should emit the correct index in the original contributions array',
          );

          // Check that the last upkeep time has been updated
          assert.equal(
            Number(await contributorAccountContract.getLastUpkeep()),
            (await txReceipt.events[0].getBlock()).timestamp,
            'Should update the last upkeep time',
          );

          // Check that the contribution has been updated correctly
          const contribution = (
            await contributorAccountContract.getContributions()
          )[0];

          assert.deepEqual(
            contribution.amountDistributed,
            amountToDistribute,
            'Should update the amount distributed',
          );

          // Check the project contract balance
          assert.deepEqual(
            await ethers.provider.getBalance(projectContract.address),
            amountToDistribute,
            'Should have sent the correct amount to the project contract',
          );
        });
      });

      /* -------------------------------------------------------------------------- */
      /*                               Admin functions                              */
      /* -------------------------------------------------------------------------- */

      describe('setUpkeepInterval', function () {
        it('Should revert if not owner', async () => {
          await expect(
            contributorAccountContract
              .connect(notUser)
              .setUpkeepInterval(86400), // 1 day
          ).to.be.revertedWith('DACContributorAccount__NOT_OWNER()');
        });

        it('Should revert if the new interval is too low or too high', async () => {
          // It should not be lower than 1 day
          await expect(
            contributorAccountContract.setUpkeepInterval(86399), // 1 day - 1 second
          ).to.be.revertedWith(
            'DACContributorAccount__INVALID_UPKEEP_INTERVAL()',
          );

          // It should not be higher than 30 days
          await expect(
            contributorAccountContract.setUpkeepInterval(2592001), // 30 days + 1 second
          ).to.be.revertedWith(
            'DACContributorAccount__INVALID_UPKEEP_INTERVAL()',
          );
        });

        it('Should update the interval and emit the correct event', async () => {
          // Update the interval
          const tx = await contributorAccountContract.setUpkeepInterval(
            86400, // 1 day
          );
          const txReceipt = await tx.wait(1);

          // Check the interval
          assert.equal(
            Number(await contributorAccountContract.getUpkeepInterval()),
            86400,
            'Should update the interval',
          );

          // Check the event
          assert.equal(
            txReceipt.events[0].event,
            'DACContributorAccount__UpkeepIntervalUpdated',
            'Should emit the correct event',
          );
          assert.equal(
            txReceipt.events[0].args.interval,
            86400,
            'Should emit the correct interval',
          );
        });
      });

      /* -------------------------------------------------------------------------- */
      /*                                   Helpers                                  */
      /* -------------------------------------------------------------------------- */

      /**
       * @dev Calculate the expected amount to distribute at x time
       * @param {object} contribution - Contribution object
       * @param {number} timestamp - Time to calculate the expected amount
       */

      const calculateContributionAt = async (contribution, timestamp) => {
        timestamp = ethers.BigNumber.isBigNumber(timestamp)
          ? timestamp
          : ethers.BigNumber.from(timestamp.toString());

        // If there is nothing to distribute anymore, return 0
        if (contribution.amountStored.isZero()) return ethers.constants.Zero;

        // If the contribution period has ended, return the amount that is left
        if (contribution.endsAt.lt(timestamp))
          return contribution.amountStored.sub(contribution.amountDistributed);

        // Calculate the amount of the contribution that should be sent based on the time left
        const remainingDuration = contribution.endsAt.sub(timestamp);
        const remainingIntervals = await remainingDuration.div(
          await contributorAccountContract.getUpkeepInterval(),
        );
        const remainingAmount = contribution.amountStored.sub(
          contribution.amountDistributed,
        );

        // Calculate the amount to distribute based on the remaining intervals.
        // If there's an incomplete interval, it will be counted as a whole one.
        return remainingAmount.div(remainingIntervals.add(2));
        // "+1" for rounding up and "+1" for the incomplete interval (we want a payment at the end of the period)
      };

      /**
       * @dev Calculate the approximate price of an upkeep
       * @param {number} gasPrice - Gas price dedicated to the upkeep
       * @param {number} upkeepGasLimit - Gas limit dedicated to the upkeep
       * @param {number} paymentPremiumPercent - Premium percent dedicated on this chain
       * @param {number} nativeTokenLinkRate - Rate of the native token to LINK
       * @returns {number} - Approximate price of an upkeep in LINK
       */

      const calculateUpkeepPrice = async (
        gasPrice,
        upkeepGasLimit,
        paymentPremiumPercent,
        nativeTokenLinkRate,
      ) =>
        gasPrice
          // .div(1e9)
          .mul(upkeepGasLimit)
          .mul(paymentPremiumPercent.div(100).add(1))
          .add(
            gasPrice /* .div(1e9) */
              .mul(80000),
          )
          .mul(nativeTokenLinkRate.div(100));

      /**
       * @dev Get the timestamp of one month from now
       * @returns {number} - Timestamp of one month from now
       */

      const inOneMonth = async () => {
        return (await time.latest()) + 30 * 24 * 60 * 60;
      };
    });
