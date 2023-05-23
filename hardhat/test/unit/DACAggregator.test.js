const { deployments, network, ethers } = require('hardhat');
const { assert, expect } = require('chai');
const {
  developmentChains,
  PHASE_PERIOD,
} = require('../../helper-hardhat-config');

!developmentChains.includes(network.name)
  ? describe.skip
  : describe('DACAggregator unit tests', function () {
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
          target: ethers.utils.parseEther('10'), // target of 10 ETH
          timeSpan: 2 * 30 * 24 * 60 * 60, // time span of 2 months
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
            await dacAggregatorContract.getPhasePeriod(),
            PHASE_PERIOD,
            'Should initialize the phase period with the right value',
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
            'DACAggregator__submitProject__INVALID_LENGTH()',
            'Should revert if there are more shares than collaborators',
          );
          await expect(
            dacAggregatorContract.submitProject(...Object.values(args2)),
          ).to.be.revertedWith(
            'DACAggregator__submitProject__INVALID_LENGTH()',
            'Should revert if there are more collaborators than shares',
          );
        });

        // same if sender not included in collaborators, total shares not 100, timeSpan not > 30 days, name not between 2 and 50 characters
        it('Should revert if the called is not included in the collaborators array', async () => {
          const args = {
            ...submitProjectArgs,
            collaborators: [user.address, user.address], // remove the caller address
          };

          await expect(
            dacAggregatorContract.submitProject(...Object.values(args)),
          ).to.be.revertedWith(
            'DACAggregator__submitProject__DOES_NOT_INCLUDE_INITIATOR()',
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
            'DACAggregator__submitProject__INVALID_SHARES()',
            'Should revert if the total shares is not 100%',
          );
        });

        it('Should revert if the timeSpan is not > 30 days', async () => {
          const args = {
            ...submitProjectArgs,
            timeSpan: 29 * 24 * 60 * 60, // time span of 29 days
          };

          await expect(
            dacAggregatorContract.submitProject(...Object.values(args)),
          ).to.be.revertedWith(
            'DACAggregator__submitProject__INVALID_TIMESPAN()',
            'Should revert if the timeSpan is not > 30 days',
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
            'DACAggregator__submitProject__INVALID_NAME()',
            'Should revert if the name is not between 2 and 50 characters',
          );
        });

        it('Should submit a project successfully and add it to the mapping', async () => {
          // Submit the project
          await dacAggregatorContract.submitProject(
            ...Object.values(submitProjectArgs),
          );

          // Grab the projects and this specifig one
          const projects = await dacAggregatorContract.getProjects();
          const project = await dacAggregatorContract.getProjectAtIndex(0);

          // Check the project is added to the array
          assert.equal(
            projects.length,
            1,
            'There should be 1 project in the array',
          );
          assert.deepEqual(
            projects[0],
            project,
            'The only project should be the one just submitted',
          );

          // Check the values in the project
          assert.equal(
            project.initiator,
            deployer.address,
            'The initiator should be the deployer',
          );
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
            Number(project.target),
            submitProjectArgs.target,
            'The target should be the one submitted',
          );
          assert.equal(
            Number(project.timeSpan),
            submitProjectArgs.timeSpan,
            'The timeSpan should be the one submitted',
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
        });

        // ! also create a child contract, upkeep subscription but maybe these checks in the child contract

        it('Should emit an event with the correct parameters', async () => {
          //
        });
      });
    });
