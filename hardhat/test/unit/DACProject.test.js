const { deployments, network, ethers } = require('hardhat');
const { assert, expect } = require('chai');
const {
  developmentChains,
  PLACEHOLDER_ADDRESS,
} = require('../../helper-hardhat-config');

!developmentChains.includes(network.name)
  ? describe.skip
  : describe.only('DACProject unit tests', function () {
      let deployer; // initiator of the project
      let user; // not a collaborator in the project
      let dacProjectContract;
      let creationTxReceipt;

      beforeEach(async () => {
        const accounts = await ethers.getSigners();
        deployer = accounts[0];
        user = accounts[1];
        await deployments.fixture(['all']);

        // Create a project using the factory
        const dacAggregatorContract = await ethers.getContract(
          'DACAggregator',
          deployer,
        );
        const submitProjectArgs = {
          collaborators: [deployer.address, PLACEHOLDER_ADDRESS], // collaborators
          shares: [70, 30], // shares of 70% and 30%
          paymentInterval: 7 * 24 * 60 * 60, // payment interval of 7 days
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
              Number(collaborator.totalWithdrawn),
              0,
              'Should initialize the total withdrawn with the right value',
            );
          }
          // Initiator
          assert.equal(
            await dacProjectContract.getInitiator(),
            deployer.address,
            'Should initialize the initiator with the right value',
          );
          // Payment interval
          assert.equal(
            Number(await dacProjectContract.getPaymentInterval()),
            submitProjectArgs.paymentInterval,
            'Should initialize the payment interval with the right value',
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

          // Active phase
          assert.equal(
            await dacProjectContract.isActive(),
            true,
            'Should initialize the active phase with the right value',
          );
          // Last time a collaborator manifested themselves
          assert.equal(
            Number(
              await dacProjectContract.getLastCollaboratorCheckTimestamp(),
            ),
            (await creationTxReceipt.events[0].getBlock()).timestamp,
            'Should initialize the last time a collaborator manifested themselves with the right value',
          );
          // Last time a payment was made
          assert.equal(
            Number(await dacProjectContract.getLastPaymentTimestamp()),
            (await creationTxReceipt.events[0].getBlock()).timestamp,
            'Should initialize the last time a payment was made with the right value',
          );
        });
      });

      // ...
    });
