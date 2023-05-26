const { deployments, network, ethers } = require('hardhat');
const { assert, expect } = require('chai');
const {
  developmentChains,
  chainlink,
  MAX_CONTRIBUTIONS,
} = require('../../helper-hardhat-config');

!developmentChains.includes(network.name)
  ? describe.skip
  : describe.only('DACAggregator unit tests', function () {
      let deployer;
      let user;
      let dacAggregatorContract;
      let submitProjectArgs = {};

      beforeEach(async () => {
        const accounts = await ethers.getSigners();
        deployer = accounts[0];
        user = accounts[1];
        await deployments.fixture(['all']);

        dacAggregatorContract = await ethers.getContract(
          'DACAggregator',
          deployer,
        );

        submitProjectArgs = {
          collaborators: [deployer.address, user.address], // collaborators
          shares: [70, 30], // shares of 70% and 30%
          name: 'Project 1', // project name
          description: 'Project 1 description', // project description
        };
      });

      /* -------------------------------------------------------------------------- */
      /*                                 constructor                                */
      /* -------------------------------------------------------------------------- */

      describe('constructor', function () {
        it('Should initialize the variables with the right value', async () => {
          assert.equal(
            await dacAggregatorContract.getOwner(),
            deployer.address,
            'Should initialize the owner with the deployer address',
          );
          assert.equal(
            await dacAggregatorContract.getMaxContributions,
            MAX_CONTRIBUTIONS,
            'Should initialize the max contributions with the right value',
          );
          // Chainlink
          assert.equal(
            await dacAggregatorContract.getLinkTokenAddress(),
            chainlink[network.name].LINK_TOKEN,
            'Should initialize the LINK token address with the right address',
          );
          assert.equal(
            await dacAggregatorContract.getKeeperRegistrarAddress(),
            chainlink[network.name].REGISTRAR,
            'Should initialize the keeper registrar address with the right address',
          );
          assert.equal(
            await dacAggregatorContract.getKeeperRegistryAddress(),
            chainlink[network.name].REGISTRY,
            'Should initialize the keeper registry address with the right address',
          );
          assert.equal(
            await dacAggregatorContract.getNativeTokenLinkRate(),
            chainlink[network.name].NATIVE_TOKEN_LINK_RATE,
            'Should initialize the native token link rate with the right value',
          );
          assert.equal(
            await dacAggregatorContract.getPremiumPercent(),
            chainlink[network.name].PREMIUM_PERCENT,
            'Should initialize the payment premium percent with the right value',
          );
          assert.equal(
            await dacAggregatorContract.getUpkeepGasLimit(),
            chainlink[network.name].GAS_LIMIT,
            'Should initialize the upkeep gas limit with the right value',
          );
        });
      });

      /* -------------------------------------------------------------------------- */
      /*                                submitProject                               */
      /* -------------------------------------------------------------------------- */

      describe('submitProject', function () {
        it('Should revert there is a length mismatch between collaborators and shares', async () => {
          // If there are more shares than collaborators
          const args = {
            ...submitProjectArgs,
            collaborators: [deployer.address], // remove a collaborator
          };
          // If there are more collaborators than shares
          const args2 = {
            ...submitProjectArgs,
            shares: [70], // remove a share
          };

          await expect(
            dacAggregatorContract.submitProject(...Object.values(args)),
          ).to.be.revertedWith(
            'DACAggregator__INVALID_LENGTH()',
            'Should revert if there are more shares than collaborators',
          );
          await expect(
            dacAggregatorContract.submitProject(...Object.values(args2)),
          ).to.be.revertedWith(
            'DACAggregator__INVALID_LENGTH()',
            'Should revert if there are more collaborators than shares',
          );
        });

        // same if sender not included in collaborators, total shares not 100, timeSpan not > 30 days, name not between 2 and 50 characters
        it('Should revert if the caller is not included in the collaborators array', async () => {
          const args = {
            ...submitProjectArgs,
            collaborators: [user.address, user.address], // remove the caller address
          };

          await expect(
            dacAggregatorContract.submitProject(...Object.values(args)),
          ).to.be.revertedWith(
            'DACAggregator__DOES_NOT_INCLUDE_INITIATOR()',
            'Should revert if the called (initiator) is not included in collaborators',
          );
        });

        it('Should revert if the total shares is not 100', async () => {
          const args = {
            ...submitProjectArgs,
            shares: [70, 40], // total shares is 110
          };

          await expect(
            dacAggregatorContract.submitProject(...Object.values(args)),
          ).to.be.revertedWith(
            'DACAggregator__INVALID_SHARES()',
            'Should revert if the total shares is not 100%',
          );
        });

        it('Should revert if the name is not between 2 and 50 characters', async () => {
          const args = {
            ...submitProjectArgs,
            name: 'P', // name of 1 character
          };

          await expect(
            dacAggregatorContract.submitProject(...Object.values(args)),
          ).to.be.revertedWith(
            'DACAggregator__INVALID_NAME()',
            'Should revert if the name is not between 2 and 50 characters',
          );
        });

        it('Should submit a project successfully and add it to the array', async () => {
          // Submit the project
          const tx = await dacAggregatorContract.submitProject(
            ...Object.values(submitProjectArgs),
          );
          const txReceipt = await tx.wait(1);
          // Get the address of the child contract
          const projectAddress = txReceipt.events.filter(
            (e) => e.event === 'DACAggregator__ProjectSubmitted',
          )[0].args[0].projectContract;

          // Grab the projects
          const project = await dacAggregatorContract.getProject(
            projectAddress,
          );

          // Check the values in the project
          assert.deepEqual(
            project.collaborators,
            submitProjectArgs.collaborators,
            'The collaborators should be the ones submitted',
          );
          assert.deepEqual(
            project.shares.map((share) => Number(share)),
            submitProjectArgs.shares,
            'The shares should be the ones submitted',
          );
          assert.equal(
            project.initiator,
            deployer.address,
            'The initiator should be the deployer',
          );
          assert.equal(
            project.name,
            submitProjectArgs.name,
            'The name should be the one submitted',
          );
          assert.equal(
            project.description,
            submitProjectArgs.description,
            'The description should be the one submitted',
          );

          // Check that the address of the child contract points to the right contract
          const childContract = await ethers.getContractAt(
            'DACProject',
            projectAddress,
          );
          assert.equal(
            await childContract.getName(),
            submitProjectArgs.name,
            'The name of the child contract should be the one submitted',
          );
        });

        it('Should emit an event with the correct parameters', async () => {
          // Submit the project
          const tx = await dacAggregatorContract.submitProject(
            ...Object.values(submitProjectArgs),
          );
          const txReceipt = await tx.wait(1);

          // Test the event parameters
          const event = txReceipt.events[0].args[0];
          assert.deepEqual(
            event.collaborators,
            submitProjectArgs.collaborators,
            'The collaborators should be the ones submitted',
          );
          assert.deepEqual(
            event.shares.map((share) => Number(share)),
            submitProjectArgs.shares,
            'The shares should be the ones submitted',
          );
          assert.equal(
            event.initiator,
            deployer.address,
            'The initiator should be the deployer',
          );
          assert.equal(
            event.name,
            submitProjectArgs.name,
            'The name should be the one submitted',
          );
          assert.equal(
            event.description,
            submitProjectArgs.description,
            'The description should be the one submitted',
          );
        });

        /* -------------------------------------------------------------------------- */
        /*                          createContributorAccount                          */
        /* -------------------------------------------------------------------------- */

        describe('createContributorAccount', function () {
          //   function createContributorAccount(uint256 _paymentInterval) external {
          //     // It should not have a contributor account already
          //     if (s_contributors[msg.sender] != address(0))
          //         revert DACAggregator__ALREADY_EXISTS();

          //     // It should be at least 1 day and at most 30 days
          //     if (_paymentInterval < 1 days || _paymentInterval > 30 days)
          //         revert DACAggregator__INVALID_PAYMENT_INTERVAL();

          //     // Create a child contract for the contributor
          //     DACContributorAccount contributorContract = new DACContributorAccount(
          //         msg.sender,
          //         i_linkTokenAddress,
          //         i_keeperRegistrarAddress,
          //         i_keeperRegistryAddress,
          //         _paymentInterval,
          //         s_maxContributions,
          //         s_upkeepGasLimit
          //     );

          //     // Add it to the contributors array and mapping
          //     s_contributors[msg.sender] = address(contributorContract);

          //     emit DACAggregator__ContributorAccountCreated(
          //         msg.sender,
          //         address(contributorContract)
          //     );
          // }

          it('Should revert if the caller already has a contributor account', async () => {
            await dacAggregatorContract.createContributorAccount(86400); // 1 day
            await expect(
              dacAggregatorContract.createContributorAccount(86400),
            ).to.be.revertedWith(
              'DACAggregator__ALREADY_EXISTS()',
              'Should revert if the caller already has a contributor account',
            );
          });
        });
      });
    });
