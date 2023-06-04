const { deployments, network, ethers } = require('hardhat');
const { assert, expect } = require('chai');
const { developmentChains } = require('../../helper-hardhat-config');
const { time } = require('@nomicfoundation/hardhat-network-helpers');

!developmentChains.includes(network.name)
  ? describe.skip
  : describe('DACProject unit tests', function () {
      let deployer; // initiator of the project
      let user; // collaborator
      let notUser; // not a collaborator
      let dacProjectContract;
      let contributorAccountContract;
      let creationTxReceipt;

      beforeEach(async () => {
        const accounts = await ethers.getSigners();
        deployer = accounts[0];
        user = accounts[1];
        notUser = accounts[2];
        await deployments.fixture(['all']);

        // Create a project using the factory
        const dacAggregatorContract = await ethers.getContract(
          'MockDACAggregator',
          deployer,
        );
        const submitProjectArgs = {
          collaborators: [deployer.address, user.address], // collaborators
          shares: [70, 30], // shares of 70% and 30%
          name: 'Project 1', // project name
          description: 'Project 1 description', // project description
          links: 'https://project1.com', // project links
          tags: 'tag1,tag2', // project tags
        };
        const tx = await dacAggregatorContract.submitProject(
          ...Object.values(submitProjectArgs),
        );
        creationTxReceipt = await tx.wait(1);

        // Grab the project contract
        const projectContractAddress =
          creationTxReceipt.events[0].args[0].projectContract;
        dacProjectContract = await ethers.getContractAt(
          'DACProject',
          projectContractAddress,
        );
      });

      /* -------------------------------------------------------------------------- */
      /*                                 constructor                                */
      /* -------------------------------------------------------------------------- */

      describe('constructor', function () {
        it('Should initialize the variables with the right value', async () => {
          const submitProjectArgs = creationTxReceipt.events[0].args[0];

          // Collaborators
          assert.deepEqual(
            await dacProjectContract.getCollaboratorsAddresses(),
            submitProjectArgs.collaborators,
            'Should initialize the collaborators with the right value',
          );
          // Collaborator information
          for (let i = 0; i < submitProjectArgs.shares.length; i++) {
            const collaborator = await dacProjectContract.getCollaborator(
              submitProjectArgs.collaborators[i],
            );

            assert.deepEqual(
              collaborator.share,
              submitProjectArgs.shares[i],
              'Should initialize the shares with the right value',
            );
            assert.equal(
              Number(collaborator.amountAvailable),
              0,
              'Should initialize the total withdrawn with the right value',
            );
          }
          // Contributors
          assert.deepEqual(
            await dacProjectContract.getContributorsAddresses(),
            [],
            'Should initialize the contributors with the right value',
          );
          // Total raised
          assert.equal(
            Number(await dacProjectContract.getTotalRaised()),
            0,
            'Should initialize the total raised with the right value',
          );
          // Contributors with amounts
          assert.deepEqual(
            await dacProjectContract.getContributorsWithAmounts(),
            [[], []],
            'Should initialize the contributors with amounts with the right value',
          );
          // Initiator
          assert.equal(
            await dacProjectContract.getInitiator(),
            deployer.address,
            'Should initialize the initiator with the right value',
          );
          // Name
          assert.equal(
            await dacProjectContract.getName(),
            submitProjectArgs.name,
            'Should initialize the name with the right value',
          );
          // Description
          assert.equal(
            await dacProjectContract.getDescription(),
            submitProjectArgs.description,
            'Should initialize the description with the right value',
          );
          // Links
          assert.equal(
            await dacProjectContract.getUrls(),
            submitProjectArgs.links,
            'Should initialize the links with the right value',
          );
          // Tags
          assert.equal(
            await dacProjectContract.getTags(),
            submitProjectArgs.tags,
            'Should initialize the tags with the right value',
          );
          // Creation date
          assert.equal(
            await dacProjectContract.getCreatedAt(),
            (await creationTxReceipt.events[0].getBlock()).timestamp,
            'Should initialize the creation date with the right value',
          );
        });
      });

      /* -------------------------------------------------------------------------- */
      /*                              receive/fallback                              */
      /* -------------------------------------------------------------------------- */

      describe('receive/fallback', function () {
        it('Should distribute the available amounts correctly in case someone directly sends funds to the contract', async () => {
          const submitProjectArgs = creationTxReceipt.events[0].args[0];

          // Send 1 ETH to the contract (will trigger receive)
          await deployer.sendTransaction({
            to: dacProjectContract.address,
            value: ethers.utils.parseEther('1'),
          });
          // Do it again but trigger fallback
          await deployer.sendTransaction({
            to: dacProjectContract.address,
            value: ethers.utils.parseEther('1'),
            data: '0x1234',
          });

          // Check the balance of the contract
          assert.equal(
            Number(
              await ethers.provider.getBalance(dacProjectContract.address),
            ),
            ethers.utils.parseEther('2'),
            'Should have the right balance',
          );

          // Check the balance of the collaborators
          submitProjectArgs.collaborators.forEach(
            async (collaboratorAddress) => {
              const collaborator = await dacProjectContract.getCollaborator(
                collaboratorAddress,
              );
              assert.equal(
                Number(collaborator.amountAvailable),
                ethers.utils.parseEther('2') * (collaborator.share / 100),
                'Should have the right available amount',
              );
            },
          );
        });

        it('Should distribute the available amounts correctly in case someone sends funds to the contract from a contributor account', async () => {
          const submitProjectArgs = creationTxReceipt.events[0].args[0];

          // Create a contributor account
          await createContributorAccount();
          // Create a subscription and transfer the contribution
          const expectedAmount = await createContributionAndTransfer(
            ethers.utils.parseEther('1'), // Contribution of 1 ETH
            60 * 60 * 24 * 7 * 4, // to be distributed over 4 weeks
            60 * 60 * 24 * 7, // Pass 1 week before sending the funds
          );

          /// Collaborators
          // Check the balance of the contract
          assert.equal(
            Number(
              await ethers.provider.getBalance(dacProjectContract.address),
            ),
            expectedAmount,
            'Should have the right balance',
          );
          // Check the shares available for the collaborators
          submitProjectArgs.collaborators.forEach(
            async (collaboratorAddress) => {
              const collaborator = await dacProjectContract.getCollaborator(
                collaboratorAddress,
              );

              assert.equal(
                Number(collaborator.amountAvailable),
                expectedAmount * (collaborator.share / 100),
                'Should have the right available amount',
              );
            },
          );
          // Check the total raised
          assert.equal(
            Number(await dacProjectContract.getTotalRaised()),
            expectedAmount,
            'Should have the right total raised',
          );

          /// Contributors
          // Check the contributors
          const contributors =
            await dacProjectContract.getContributorsAddresses();
          assert.equal(
            contributors.length,
            1,
            'Should have the right number of contributors',
          );
          assert.equal(
            contributors[0],
            contributorAccountContract.address,
            'Should have the right contributor',
          );
          // Check the amount for the contributor
          assert.equal(
            Number(
              await dacProjectContract.getContributedAmount(
                contributorAccountContract.address,
              ),
            ),
            expectedAmount,
            'Should have the right contributed amount',
          );
          // Check the contributors with amounts
          const contributorsWithAmounts =
            await dacProjectContract.getContributorsWithAmounts();
          assert.equal(
            contributorsWithAmounts[0][0],
            contributorAccountContract.address,
            'Should have the right contributor',
          );
          assert.equal(
            Number(contributorsWithAmounts[1][0]),
            expectedAmount,
            'Should have the right contributed amount',
          );
        });

        it('Should emit the correct event with the correct parameters', async () => {
          // receive
          await expect(
            deployer.sendTransaction({
              to: dacProjectContract.address,
              value: ethers.utils.parseEther('1'),
            }),
          )
            .to.emit(dacProjectContract, 'DACProject__ReceivedContribution')
            .withArgs(deployer.address, ethers.utils.parseEther('1'));

          // fallback
          await expect(
            deployer.sendTransaction({
              to: dacProjectContract.address,
              value: ethers.utils.parseEther('1'),
              data: '0x1234',
            }),
          )
            .to.emit(dacProjectContract, 'DACProject__ReceivedContribution')
            .withArgs(deployer.address, ethers.utils.parseEther('1'));
        });
      });

      /* -------------------------------------------------------------------------- */
      /*                                withdrawShare                               */
      /* -------------------------------------------------------------------------- */

      describe('withdrawShare', function () {
        let expectedAmount;

        beforeEach(async () => {
          // Create a contributor account
          await createContributorAccount();
          // Create a subscription and transfer the contribution
          expectedAmount = await createContributionAndTransfer(
            ethers.utils.parseEther('1'), // Contribution of 1 ETH
            60 * 60 * 24 * 7 * 4, // to be distributed over 4 weeks
            60 * 60 * 24 * 7, // Pass 1 week before sending the funds
          );
        });

        it('Should revert if the caller is not a collaborator', async () => {
          await expect(
            dacProjectContract
              .connect(notUser)
              .withdrawShare(ethers.utils.parseEther('1')),
          ).to.be.revertedWith('DACProject__NOT_COLLABORATOR()');
        });

        it('Should revert if the collaborator does not have enough funds available', async () => {
          // Get the share available for the collaborator
          const collaborator = await dacProjectContract.getCollaborator(
            user.address,
          );

          // Withdraw the share
          await expect(
            dacProjectContract
              .connect(user)
              .withdrawShare(collaborator.amountAvailable.add(1)),
          ).to.be.revertedWith('DACProject__NOT_ENOUGH_FUNDS_AVAILABLE()');
        });

        it('Should withdraw the share correctly', async () => {
          // Get the share available for the collaborator
          const collaborator = await dacProjectContract.getCollaborator(
            user.address,
          );
          // And their initial balance
          const initialBalance = await ethers.provider.getBalance(user.address);

          // Withdraw the share
          const tx = await dacProjectContract
            .connect(user)
            .withdrawShare(collaborator.amountAvailable);
          const txReceipt = await tx.wait(1);

          // Get the gas used
          const gasUsed = txReceipt.cumulativeGasUsed.mul(
            txReceipt.effectiveGasPrice,
          );

          // Check the balance of the collaborator
          assert.deepEqual(
            await ethers.provider.getBalance(user.address),
            initialBalance.add(collaborator.amountAvailable).sub(gasUsed),
            'Should have the right balance',
          );
          // Check the amount available for the collaborator
          assert.equal(
            Number(
              (await dacProjectContract.getCollaborator(user.address))
                .amountAvailable,
            ),
            0,
            'Should have no funds available to withdraw',
          );
        });

        it('Should work correctly with multiple contributions and withdrawals', async () => {
          // Just a small simulation to verify that everything is working correctly
          // Get the initial values
          const collaborators = [
            await dacProjectContract.getCollaborator(deployer.address),
            await dacProjectContract.getCollaborator(user.address),
          ];
          const initialBalances = [
            Number(await ethers.provider.getBalance(deployer.address)),
            Number(await ethers.provider.getBalance(user.address)),
          ];
          const availableShares = [
            Number(collaborators[0].amountAvailable),
            Number(collaborators[1].amountAvailable),
          ];
          const withdrawnShares = [0, 0];
          const spentGas = [0, 0];
          // There should already be some funds raised
          let totalRaised = expectedAmount;
          // Withdraw the share
          const txWithdraw1 = await dacProjectContract
            .connect(deployer)
            .withdrawShare(collaborators[0].amountAvailable);
          const txReceipt1 = await txWithdraw1.wait(1);

          // Update gas & shares
          spentGas[0] += Number(
            txReceipt1.cumulativeGasUsed.mul(txReceipt1.effectiveGasPrice),
          );
          availableShares[0] -= Number(collaborators[0].amountAvailable);
          withdrawnShares[0] += Number(collaborators[0].amountAvailable);

          // Send some money again
          const contributionAmount = ethers.utils.parseEther('1');
          const txContribution2 = await notUser.sendTransaction({
            to: dacProjectContract.address,
            value: contributionAmount,
          });
          await txContribution2.wait(1);

          // Update the total raised & available shares
          totalRaised += Number(contributionAmount);
          availableShares[0] += Number(
            (contributionAmount * Number(collaborators[0].share)) / 100,
          );
          availableShares[1] += Number(
            (contributionAmount * Number(collaborators[1].share)) / 100,
          );

          // Withdraw part of the share
          const txWithdraw2 = await dacProjectContract
            .connect(user)
            .withdrawShare(collaborators[1].amountAvailable.div(2));
          const txReceipt2 = await txWithdraw2.wait(1);

          // Update gas & shares
          spentGas[1] += Number(
            txReceipt2.cumulativeGasUsed.mul(txReceipt2.effectiveGasPrice),
          );
          availableShares[1] -= Number(collaborators[1].amountAvailable.div(2));
          withdrawnShares[1] += Number(collaborators[1].amountAvailable.div(2));

          // Send some money again
          const txContribution3 = await notUser.sendTransaction({
            to: dacProjectContract.address,
            value: contributionAmount,
          });
          await txContribution3.wait(1);
          // expected 140 ETH but 1.4 ETH
          // Update the total raised & available shares
          totalRaised += Number(contributionAmount);
          availableShares[0] += Number(
            (contributionAmount * Number(collaborators[0].share)) / 100,
          );
          availableShares[1] += Number(
            (contributionAmount * Number(collaborators[1].share)) / 100,
          );

          // Test the values
          // Balances
          const tolerance = 1e8;
          assert.approximately(
            Number(await ethers.provider.getBalance(deployer.address)),
            initialBalances[0] + withdrawnShares[0] - spentGas[0],
            tolerance,
            'Should return the right balance for the deployer',
          );
          assert.approximately(
            Number(await ethers.provider.getBalance(user.address)),
            initialBalances[1] + withdrawnShares[1] - spentGas[1],
            tolerance,
            'Should return the right balance for the user',
          );
          // Amount available
          assert.equal(
            Number(
              (await dacProjectContract.getCollaborator(deployer.address))
                .amountAvailable,
            ),
            availableShares[0],
            'Should return the right amount available for the deployer',
          );
          assert.equal(
            Number(
              (await dacProjectContract.getCollaborator(user.address))
                .amountAvailable,
            ),
            availableShares[1],
            'Should return the right amount available for the user',
          );
          // Total raised
          assert.equal(
            Number(await dacProjectContract.getTotalRaised()),
            totalRaised,
            'Should return the right total raised',
          );

          // Contract balance
          assert.equal(
            Number(
              await ethers.provider.getBalance(dacProjectContract.address),
            ),
            totalRaised - withdrawnShares[0] - withdrawnShares[1],
            'Should return the right contract balance',
          );

          // Contributions
          assert.equal(
            Number(
              await dacProjectContract.getContributedAmount(notUser.address),
            ),
            Number(contributionAmount) * 2, // 2 direct contributions, the initial one is made through their contributor contract
            'Should return the right contributed amount',
          );
          assert.deepEqual(
            await dacProjectContract.getContributorsAddresses(),
            [contributorAccountContract.address, notUser.address],
            'Should return the right contributors addresses (contributor account & individual)',
          );
          assert.deepEqual(
            await dacProjectContract.getContributorsWithAmounts(),
            [
              [contributorAccountContract.address, notUser.address],
              [
                ethers.BigNumber.from(expectedAmount.toString()),
                contributionAmount.mul(2),
              ],
            ],
            'Should return the right contributors addresses with amounts (contributor account & individual)',
          );
        });

        it('Should emit the correct event with the correct parameters', async () => {
          // Get the available funds
          const availableShare = (
            await dacProjectContract.getCollaborator(user.address)
          ).amountAvailable;

          await expect(
            dacProjectContract.connect(user).withdrawShare(availableShare),
          )
            .to.emit(dacProjectContract, 'DACProject__ShareWithdrawn')
            .withArgs(user.address, availableShare);
        });
      });

      /**
       * @dev Create a contributor account
       */

      const createContributorAccount = async () => {
        // Grab the aggregator contract
        const dacAggregatorContract = await ethers.getContract(
          'MockDACAggregator',
          notUser,
        );
        // Create the account
        const paymentInterval = 60 * 60 * 24 * 7; // 1 week
        const tx = await dacAggregatorContract.createContributorAccount(
          paymentInterval,
        );
        await tx.wait(1);

        // Grab the contract
        const contributorAccountAddress =
          await dacAggregatorContract.getContributorAccount(notUser.address);
        contributorAccountContract = await ethers.getContractAt(
          'MockDACContributorAccount',
          contributorAccountAddress,
        );
      };

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
            dacProjectContract.address,
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
