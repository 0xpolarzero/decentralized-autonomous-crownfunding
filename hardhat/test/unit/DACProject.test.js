const { deployments, network, ethers } = require('hardhat');
const { assert, expect } = require('chai');
const { developmentChains } = require('../../helper-hardhat-config');
const { time } = require('@nomicfoundation/hardhat-network-helpers');

!developmentChains.includes(network.name)
  ? describe.skip
  : describe.only('DACProject unit tests', function () {
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
          // Creation date
          assert.equal(
            await dacProjectContract.getCreatedAt(),
            (await creationTxReceipt.events[0].getBlock()).timestamp,
            'Should initialize the creation date with the right value',
          );
        });
      });

      /* -------------------------------------------------------------------------- */
      /*                                   receive                                  */
      /* -------------------------------------------------------------------------- */

      describe('receive', function () {
        it('Should distribute the available amounts correctly in case someone directly sends funds to the contract', async () => {
          const submitProjectArgs = creationTxReceipt.events[0].args[0];

          // Send 1 ETH to the contract
          await deployer.sendTransaction({
            to: dacProjectContract.address,
            value: ethers.utils.parseEther('1'),
          });

          // Check the balance of the contract
          assert.equal(
            Number(
              await ethers.provider.getBalance(dacProjectContract.address),
            ),
            ethers.utils.parseEther('1'),
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
                ethers.utils.parseEther('1') * (collaborator.share / 100),
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
      });

      /* -------------------------------------------------------------------------- */
      /*                                withdrawShare                               */
      /* -------------------------------------------------------------------------- */

      describe('withdrawShare', function () {
        //   function withdrawShare(uint256 _amount) external onlyCollaborator {
        //     // Get the amount available and withdrawn for the collaborator
        //     Collaborator memory collaborator = s_collaborators[msg.sender];

        //     // Check if the collaborator has enough funds available
        //     if (collaborator.amountAvailable < _amount)
        //         revert DACProject__NOT_ENOUGH_FUNDS_AVAILABLE();

        //     // Update the amount available
        //     unchecked {
        //         s_collaborators[msg.sender].amountAvailable -= _amount;
        //     }

        //     // Transfer the funds to the collaborator
        //     (bool success, ) = msg.sender.call{value: _amount}("");
        //     if (!success) revert DACProject__TRANSFER_FAILED();

        //     emit DACProject__ShareWithdrawn(msg.sender, _amount);
        // }

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
