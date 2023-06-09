const { deployments, network, ethers } = require('hardhat');
const { assert, expect } = require('chai');
const { developmentChains, chainlink } = require('../../helper-hardhat-config');
const { time } = require('@nomicfoundation/hardhat-network-helpers');

!developmentChains.includes(network.name)
  ? describe.skip
  : describe('DACAggregator unit tests', function () {
      let deployer;
      let user;
      let dacAggregatorContract;
      let submitProjectArgs = {};

      beforeEach(async () => {
        const accounts = await ethers.getSigners();
        deployer = accounts[0]; // initiator and collaborator
        user = accounts[1]; // collaborator
        notUser = accounts[2]; // not collaborator
        await deployments.fixture(['all']);

        dacAggregatorContract = await ethers.getContract(
          'MockDACAggregator',
          deployer,
        );

        submitProjectArgs = {
          collaborators: [deployer.address, user.address], // collaborators
          shares: [70, 30], // shares of 70% and 30%
          name: 'Project 1', // project name
          description: 'Project 1 description', // project description
          links: 'https://project1.com', // project links
          tags: 'tag1,tag2', // project tags
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
            Number(await dacAggregatorContract.getMaxContributions()),
            chainlink[network.name].MAX_CONTRIBUTIONS,
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
            'Should revert if the name is less than 2 characters',
          );

          const args2 = {
            ...submitProjectArgs,
            name: 'Project 1'.repeat(10), // name of 100 characters
          };

          await expect(
            dacAggregatorContract.submitProject(...Object.values(args2)),
          ).to.be.revertedWith(
            'DACAggregator__INVALID_NAME()',
            'Should revert if the name is more than 50 characters',
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
          assert.equal(
            project.links,
            submitProjectArgs.links,
            'The links should be the ones submitted',
          );
          assert.equal(
            project.tags,
            submitProjectArgs.tags,
            'The tags should be the ones submitted',
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
          it('Should revert if the caller already has a contributor account', async () => {
            await dacAggregatorContract.createContributorAccount(86400); // 1 day
            await expect(
              dacAggregatorContract.createContributorAccount(86400),
            ).to.be.revertedWith(
              'DACAggregator__ALREADY_EXISTS()',
              'Should revert if the caller already has a contributor account',
            );
          });

          it('Should revert if the payment interval is invalid', async () => {
            await expect(
              dacAggregatorContract.createContributorAccount(3559), // 1 second less than 1 hour
            ).to.be.revertedWith(
              'DACAggregator__INVALID_PAYMENT_INTERVAL()',
              'Should revert if the payment interval is less than 1 hour',
            );

            await expect(
              dacAggregatorContract.createContributorAccount(2592001), // 1 second more than 30 days
            ).to.be.revertedWith(
              'DACAggregator__INVALID_PAYMENT_INTERVAL()',
              'Should revert if the payment interval is more than 30 days',
            );
          });

          it('Should create a contributor account successfully', async () => {
            const tx = await dacAggregatorContract.createContributorAccount(
              86400, // 1 day
            );
            const txReceipt = await tx.wait(1);

            // Get the address of the child contract
            const emittedAddress = txReceipt.events.filter(
              (e) => e.event === 'DACAggregator__ContributorAccountCreated',
            )[0].args.contributorAccountContract;

            // Check that it was added to the mapping
            const retrievedAddress =
              await dacAggregatorContract.getContributorAccount(
                deployer.address,
              );

            assert.equal(
              emittedAddress,
              retrievedAddress,
              'The contributor contract address should be the one returned by the event',
            );

            // Quickly check that the contract is indeed deployed
            const childContract = await ethers.getContractAt(
              'MockDACContributorAccount',
              emittedAddress,
            );

            assert.equal(
              await childContract.getOwner(),
              deployer.address,
              'The owner of the child contract should be the caller of the function',
            );
          });

          it('Should emit an event with the correct parameters', async () => {
            const tx = await dacAggregatorContract.createContributorAccount(
              86400, // 1 day
            );
            const txReceipt = await tx.wait(1);
            const event = txReceipt.events[0].args;

            assert.equal(
              event.owner,
              deployer.address,
              'The contributor should be the caller of the function',
            );
            assert.equal(
              event.contributorAccountContract,
              await dacAggregatorContract.getContributorAccount(
                deployer.address,
              ),
              'The contributor account contract should be the one returned by the function',
            );
          });
        });
      });

      /* -------------------------------------------------------------------------- */
      /*                                 pingProject                                */
      /* -------------------------------------------------------------------------- */

      describe('pingProject', function () {
        let projectAddress;

        beforeEach(async () => {
          // Deploy a new project
          const tx = await dacAggregatorContract.submitProject(
            ...Object.values(submitProjectArgs),
          );
          const txReceipt = await tx.wait(1);

          projectAddress = txReceipt.events.filter(
            (e) => e.event === 'DACAggregator__ProjectSubmitted',
          )[0].args[0].projectContract;
        });

        it('Should revert if the project does not exist', async () => {
          await expect(
            dacAggregatorContract.pingProject(ethers.constants.AddressZero),
          ).to.be.revertedWith(
            'DACAggregator__DOES_NOT_EXIST()',
            'Should revert if the project does not exist',
          );
        });

        it('Should revert if the caller is not a collaborator', async () => {
          await expect(
            dacAggregatorContract.connect(notUser).pingProject(projectAddress),
          ).to.be.revertedWith(
            'DACAggregator__NOT_COLLABORATOR()',
            'Should revert if the caller is not a collaborator',
          );
        });

        it('Should revert if the project is expired (30 days of inactivity)', async () => {
          const timeToPass = 2592001; // 30 days + 1 second
          await time.increase(timeToPass);

          await expect(
            dacAggregatorContract.pingProject(projectAddress),
          ).to.be.revertedWith(
            'DACAggregator__EXPIRED()',
            'Should revert if the project is expired',
          );
          assert.equal(
            await dacAggregatorContract.isProjectActive(projectAddress),
            false,
            'The project should be inactive',
          );
        });

        it('Should update the last activity timestamp for the project', async () => {
          const currentTime = await time.latest();
          const timeToPass = 1728000; // 20 days

          // It should be at the current time
          assert.equal(
            Number(
              (await dacAggregatorContract.getProject(projectAddress))
                .lastActivityAt,
            ),
            currentTime,
            'The last activity timestamp should be the current timestamp',
          );

          // Pass 20 days
          await time.increase(timeToPass);

          // Ping it
          await dacAggregatorContract.pingProject(projectAddress);

          // It should be at the current time + 20 days
          assert.equal(
            Number(
              (await dacAggregatorContract.getProject(projectAddress))
                .lastActivityAt,
            ),
            await time.latest(),
            'The last activity timestamp should be + 20 days',
          );

          // Pass 20 more days
          await time.increase(timeToPass);

          // The project should still be active (pinged 20 days ago)
          assert.equal(
            await dacAggregatorContract.isProjectActive(projectAddress),
            true,
            'The project should still be active',
          );

          // But not after 40 days since the last ping
          await time.increase(timeToPass);

          assert.equal(
            await dacAggregatorContract.isProjectActive(projectAddress),
            false,
            'The project should be inactive after 40 days',
          );
        });
      });

      /* -------------------------------------------------------------------------- */
      /*                               ADMIN FUNCTIONS                              */
      /* -------------------------------------------------------------------------- */

      describe('setMaxContributions', function () {
        it('Should revert if the caller is not the owner', async () => {
          await expect(
            dacAggregatorContract.connect(user).setMaxContributions(10),
          ).to.be.revertedWith(
            'DACAggregator__NOT_OWNER()',
            'Should revert if the caller is not the owner',
          );
        });

        it('Should correctly update the max contributions and emit the correct event', async () => {
          await dacAggregatorContract.setMaxContributions(10);

          assert.equal(
            await dacAggregatorContract.getMaxContributions(),
            10,
            'The max contributions should be the number submitted',
          );
        });
      });

      describe('setNativeTokenLinkRate', function () {
        it('Should revert if the caller is not the owner', async () => {
          await expect(
            dacAggregatorContract.connect(user).setNativeTokenLinkRate(10),
          ).to.be.revertedWith(
            'DACAggregator__NOT_OWNER()',
            'Should revert if the caller is not the owner',
          );
        });

        it('Should correctly update the native token link rate and emit the correct event', async () => {
          await dacAggregatorContract.setNativeTokenLinkRate(10);

          assert.equal(
            await dacAggregatorContract.getNativeTokenLinkRate(),
            10,
            'The native token link rate should be the number submitted',
          );
        });
      });

      describe('setPremiumPercent', function () {
        it('Should revert if the caller is not the owner', async () => {
          await expect(
            dacAggregatorContract.connect(user).setPremiumPercent(10),
          ).to.be.revertedWith(
            'DACAggregator__NOT_OWNER()',
            'Should revert if the caller is not the owner',
          );
        });

        it('Should correctly update the premium percent and emit the correct event', async () => {
          await dacAggregatorContract.setPremiumPercent(10);

          assert.equal(
            await dacAggregatorContract.getPremiumPercent(),
            10,
            'The premium percent should be the number submitted',
          );
        });
      });

      describe('setUpkeepGasLimit', function () {
        it('Should revert if the caller is not the owner', async () => {
          await expect(
            dacAggregatorContract.connect(user).setUpkeepGasLimit(10),
          ).to.be.revertedWith(
            'DACAggregator__NOT_OWNER()',
            'Should revert if the caller is not the owner',
          );
        });

        it('Should correctly update the upkeep gas limit and emit the correct event', async () => {
          await dacAggregatorContract.setUpkeepGasLimit(10);

          assert.equal(
            await dacAggregatorContract.getUpkeepGasLimit(),
            10,
            'The upkeep gas limit should be the number submitted',
          );
        });
      });
    });
