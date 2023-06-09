import { Address, BigInt, Bytes, store } from '@graphprotocol/graph-ts';
import {
  DACAggregator__AllContributionsCanceled as AllContributionsCanceledEvent,
  DACAggregator__ContributionCreated as ContributionCreatedEvent,
  DACAggregator__ContributionUpdated as ContributionUpdatedEvent,
  DACAggregator__ContributionsTransfered as ContributionsTransferedEvent,
  DACAggregator__ContributorAccountCreated as ContributorAccountCreatedEvent,
  DACAggregator__ProjectPinged as ProjectPingedEvent,
  DACAggregator__ProjectSubmitted as ProjectSubmittedEvent,
} from '../generated/DACAggregator/DACAggregator';
import { Project, ContributorAccount, Contribution } from '../generated/schema';

/* -------------------------------------------------------------------------- */
/*                                   PROJECT                                  */
/* -------------------------------------------------------------------------- */

export function handleProjectSubmitted(event: ProjectSubmittedEvent): void {
  let project = new Project(getId(event.params.project.projectContract));
  project.name = event.params.project.name;
  project.description = event.params.project.description;
  project.links = event.params.project.links.split(',');
  project.tags = event.params.project.tags.split(',');
  project.createdAt = event.params.project.createdAt;
  project.lastActivityAt = event.params.project.lastActivityAt;
  project.projectContract = event.params.project.projectContract;
  project.initiator = event.params.project.initiator;
  project.collaborators = event.params.project.collaborators.map<Bytes>(
    (e: Bytes) => e,
  );
  project.shares = event.params.project.shares;
  project.totalRaised = BigInt.fromI32(0);

  project.save();
}

export function handleProjectPinged(event: ProjectPingedEvent): void {
  let project = Project.load(getId(event.params.projectAddress));

  // Just to satisfy the compiler, cause the project can't be pinned if it doesn't exist
  if (!project) return;

  project.lastActivityAt = event.params._event.block.timestamp;
  project.save();
}

/* -------------------------------------------------------------------------- */
/*                             CONTRIBUTOR ACCOUNT                            */
/* -------------------------------------------------------------------------- */

export function handleContributorAccountCreated(
  event: ContributorAccountCreatedEvent,
): void {
  let account = new ContributorAccount(
    getId(event.params.contributorAccountContract),
  );

  account.owner = event.params.owner;
  account.accountContract = event.params.contributorAccountContract;
  account.createdAt = event.params._event.block.timestamp;
  account.totalContributed = BigInt.fromI32(0);
  account.contributionsCount = BigInt.fromI32(0);
  account.lastContributionsTransferedAt = event.params._event.block.timestamp;

  account.save();
}

export function handleContributionCreated(
  event: ContributionCreatedEvent,
): void {
  let account = ContributorAccount.load(getId(event.params.accountContract));
  let project = Project.load(getId(event.params.contribution.projectContract));

  if (!account || !project) return;

  // Just create a new contribution to populate it and add it to the array
  let contribution = new Contribution(
    getIdForContribution(
      event.params.accountContract,
      account.contributionsCount,
    ),
  );

  contribution.account = account.id;
  contribution.project = project.id;
  contribution.amountStored = event.params.contribution.amountStored;
  contribution.amountDistributed = event.params.contribution.amountDistributed;
  contribution.startedAt = event.params.contribution.startedAt;
  contribution.endsAt = event.params.contribution.endsAt;

  account.contributionsCount = account.contributionsCount.plus(
    BigInt.fromI32(1),
  );

  contribution.save();
  account.save();
}

export function handleContributionUpdated(
  event: ContributionUpdatedEvent,
): void {
  let contribution = Contribution.load(
    getIdForContribution(
      event.params.accountContract,
      event.params.contribution.index,
    ),
  );

  // It should not be null, but just in case
  if (!contribution) return;

  contribution.amountStored = event.params.contribution.amount;
  contribution.save();
}

export function handleContributionsTransfered(
  event: ContributionsTransferedEvent,
): void {
  // Update the last transfered at
  let account = ContributorAccount.load(getId(event.params.accountContract));
  if (account)
    account.lastContributionsTransferedAt = event.params._event.block.timestamp;

  // Need to update all the contributions
  for (let i = 0; i < event.params.contributions.length; i++) {
    let contribution = Contribution.load(
      getIdForContribution(
        event.params.accountContract,
        event.params.contributions[i].index,
      ),
    );

    // It should not be null, but just in case
    if (!contribution) continue;

    contribution.amountDistributed = contribution.amountDistributed.plus(
      event.params.contributions[i].amount,
    );

    // Update the total raised for the project
    let project = Project.load(contribution.project);

    // It should not be null, but just in case
    if (!project) continue;

    project.totalRaised = project.totalRaised.plus(
      event.params.contributions[i].amount,
    );

    contribution.save();
    project.save();
  }

  if (account) account.save();
}

export function handleAllContributionsCanceled(
  event: AllContributionsCanceledEvent,
): void {
  let account = ContributorAccount.load(getId(event.params.accountContract));

  // It should not be null, but just in case
  if (!account) return;

  // Find all the contributions and update them
  for (
    let i = BigInt.fromI32(0);
    i.lt(account.contributionsCount);
    i = i.plus(BigInt.fromI32(1))
  ) {
    let contribution = Contribution.load(
      getIdForContribution(event.params.accountContract, i),
    );

    if (!contribution) continue;

    store.remove('Contribution', contribution.id);
  }

  // Reset the contributions count
  account.contributionsCount = BigInt.fromI32(0);
  account.save();
}

/* -------------------------------------------------------------------------- */
/*                                   HELPERS                                  */
/* -------------------------------------------------------------------------- */

function getId(contract: Address): string {
  return contract.toHexString();
}

function getIdForContribution(accountContract: Address, index: BigInt): string {
  return accountContract.toHexString() + '-' + index.toString();
}
