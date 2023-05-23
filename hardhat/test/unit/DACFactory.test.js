const { deployments, network, ethers } = require('hardhat');
const { assert, expect } = require('chai');
const {
  developmentChains,
  PHASE_PERIOD,
} = require('../../helper-hardhat-config');

!developmentChains.includes(network.name)
  ? describe.skip
  : describe('DACFactory unit tests', function () {
      let deployer;
      let user;
      let dacFactoryContract;
      let submitProjectArgs = {};

      beforeEach(async () => {
        const accounts = await ethers.getSigners();
        deployer = accounts[0];
        user = accounts[1];
        await deployments.fixture(['all']);

        dacFactoryContract = await ethers.getContract('DACFactory', deployer);

        submitProjectArgs = {
          collaborators: [deployer.address, user.address], // collaborators
          shares: [70, 30], // shares of 70% and 30%
          paymentInterval: 7 * 24 * 60 * 60, // payment interval of 7 days
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
            await dacFactoryContract.getOwner(),
            deployer.address,
            'Should initialize the owner with the deployer address',
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
            dacFactoryContract.submitProject(...Object.values(args)),
          ).to.be.revertedWith(
            'DACFactory__submitProject__INVALID_LENGTH()',
            'Should revert if there are more shares than collaborators',
          );
          await expect(
            dacFactoryContract.submitProject(...Object.values(args2)),
          ).to.be.revertedWith(
            'DACFactory__submitProject__INVALID_LENGTH()',
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
            dacFactoryContract.submitProject(...Object.values(args)),
          ).to.be.revertedWith(
            'DACFactory__submitProject__DOES_NOT_INCLUDE_INITIATOR()',
            'Should revert if the called (initiator) is not included in collaborators',
          );
        });

        it('Should revert if the total shares is not 100', async () => {
          const args = {
            ...submitProjectArgs,
            shares: [70, 40], // total shares is 110
          };

          await expect(
            dacFactoryContract.submitProject(...Object.values(args)),
          ).to.be.revertedWith(
            'DACFactory__submitProject__INVALID_SHARES()',
            'Should revert if the total shares is not 100%',
          );
        });

        it('Should revert if the name is not between 2 and 50 characters', async () => {
          const args = {
            ...submitProjectArgs,
            name: 'P', // name of 1 character
          };

          await expect(
            dacFactoryContract.submitProject(...Object.values(args)),
          ).to.be.revertedWith(
            'DACFactory__submitProject__INVALID_NAME()',
            'Should revert if the name is not between 2 and 50 characters',
          );
        });

        it('Should submit a project successfully and add it to the array', async () => {
          // Submit the project
          await dacFactoryContract.submitProject(
            ...Object.values(submitProjectArgs),
          );

          // Grab the projects and this specifig one
          const projects = await dacFactoryContract.getProjects();
          const project = await dacFactoryContract.getProjectAtIndex(0);

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
            Number(project.paymentInterval),
            submitProjectArgs.paymentInterval,
            'The paymentInterval should be the one submitted',
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
            project.projectContract,
          );
          assert.equal(
            await childContract.getName(),
            submitProjectArgs.name,
            'The name of the child contract should be the one submitted',
          );
        });

        it('Should emit an event with the correct parameters', async () => {
          // Submit the project
          const tx = await dacFactoryContract.submitProject(
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
            Number(event.paymentInterval),
            submitProjectArgs.paymentInterval,
            'The paymentInterval should be the one submitted',
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

          // We can't really test the address of the child contract because the only other way
          // to grab it is to call`getProjectAtIndex(0)`, which is already tested right above
        });
      });
    });
