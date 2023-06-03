import { newMockEvent } from "matchstick-as"
import { ethereum, Address, BigInt } from "@graphprotocol/graph-ts"
import {
  DACAggregator__AllContributionsCanceled,
  DACAggregator__ContributionCreated,
  DACAggregator__ContributionUpdated,
  DACAggregator__ContributionsTransfered,
  DACAggregator__ContributorAccountCreated,
  DACAggregator__MaxContributionsUpdated,
  DACAggregator__NativeTokenLinkRateUpdated,
  DACAggregator__PremiumPercentUpdated,
  DACAggregator__ProjectPinged,
  DACAggregator__ProjectSubmitted,
  DACAggregator__UpkeepGasLimitUpdated
} from "../generated/DACAggregator/DACAggregator"

export function createDACAggregator__AllContributionsCanceledEvent(
  accountContract: Address
): DACAggregator__AllContributionsCanceled {
  let dacAggregatorAllContributionsCanceledEvent = changetype<
    DACAggregator__AllContributionsCanceled
  >(newMockEvent())

  dacAggregatorAllContributionsCanceledEvent.parameters = new Array()

  dacAggregatorAllContributionsCanceledEvent.parameters.push(
    new ethereum.EventParam(
      "accountContract",
      ethereum.Value.fromAddress(accountContract)
    )
  )

  return dacAggregatorAllContributionsCanceledEvent
}

export function createDACAggregator__ContributionCreatedEvent(
  accountContract: Address,
  contribution: ethereum.Tuple
): DACAggregator__ContributionCreated {
  let dacAggregatorContributionCreatedEvent = changetype<
    DACAggregator__ContributionCreated
  >(newMockEvent())

  dacAggregatorContributionCreatedEvent.parameters = new Array()

  dacAggregatorContributionCreatedEvent.parameters.push(
    new ethereum.EventParam(
      "accountContract",
      ethereum.Value.fromAddress(accountContract)
    )
  )
  dacAggregatorContributionCreatedEvent.parameters.push(
    new ethereum.EventParam(
      "contribution",
      ethereum.Value.fromTuple(contribution)
    )
  )

  return dacAggregatorContributionCreatedEvent
}

export function createDACAggregator__ContributionUpdatedEvent(
  accountContract: Address,
  contribution: ethereum.Tuple
): DACAggregator__ContributionUpdated {
  let dacAggregatorContributionUpdatedEvent = changetype<
    DACAggregator__ContributionUpdated
  >(newMockEvent())

  dacAggregatorContributionUpdatedEvent.parameters = new Array()

  dacAggregatorContributionUpdatedEvent.parameters.push(
    new ethereum.EventParam(
      "accountContract",
      ethereum.Value.fromAddress(accountContract)
    )
  )
  dacAggregatorContributionUpdatedEvent.parameters.push(
    new ethereum.EventParam(
      "contribution",
      ethereum.Value.fromTuple(contribution)
    )
  )

  return dacAggregatorContributionUpdatedEvent
}

export function createDACAggregator__ContributionsTransferedEvent(
  accountContract: Address,
  contributions: Array<ethereum.Tuple>
): DACAggregator__ContributionsTransfered {
  let dacAggregatorContributionsTransferedEvent = changetype<
    DACAggregator__ContributionsTransfered
  >(newMockEvent())

  dacAggregatorContributionsTransferedEvent.parameters = new Array()

  dacAggregatorContributionsTransferedEvent.parameters.push(
    new ethereum.EventParam(
      "accountContract",
      ethereum.Value.fromAddress(accountContract)
    )
  )
  dacAggregatorContributionsTransferedEvent.parameters.push(
    new ethereum.EventParam(
      "contributions",
      ethereum.Value.fromTupleArray(contributions)
    )
  )

  return dacAggregatorContributionsTransferedEvent
}

export function createDACAggregator__ContributorAccountCreatedEvent(
  owner: Address,
  contributorAccountContract: Address
): DACAggregator__ContributorAccountCreated {
  let dacAggregatorContributorAccountCreatedEvent = changetype<
    DACAggregator__ContributorAccountCreated
  >(newMockEvent())

  dacAggregatorContributorAccountCreatedEvent.parameters = new Array()

  dacAggregatorContributorAccountCreatedEvent.parameters.push(
    new ethereum.EventParam("owner", ethereum.Value.fromAddress(owner))
  )
  dacAggregatorContributorAccountCreatedEvent.parameters.push(
    new ethereum.EventParam(
      "contributorAccountContract",
      ethereum.Value.fromAddress(contributorAccountContract)
    )
  )

  return dacAggregatorContributorAccountCreatedEvent
}

export function createDACAggregator__MaxContributionsUpdatedEvent(
  maxContributions: BigInt
): DACAggregator__MaxContributionsUpdated {
  let dacAggregatorMaxContributionsUpdatedEvent = changetype<
    DACAggregator__MaxContributionsUpdated
  >(newMockEvent())

  dacAggregatorMaxContributionsUpdatedEvent.parameters = new Array()

  dacAggregatorMaxContributionsUpdatedEvent.parameters.push(
    new ethereum.EventParam(
      "maxContributions",
      ethereum.Value.fromUnsignedBigInt(maxContributions)
    )
  )

  return dacAggregatorMaxContributionsUpdatedEvent
}

export function createDACAggregator__NativeTokenLinkRateUpdatedEvent(
  nativeTokenLinkRate: BigInt
): DACAggregator__NativeTokenLinkRateUpdated {
  let dacAggregatorNativeTokenLinkRateUpdatedEvent = changetype<
    DACAggregator__NativeTokenLinkRateUpdated
  >(newMockEvent())

  dacAggregatorNativeTokenLinkRateUpdatedEvent.parameters = new Array()

  dacAggregatorNativeTokenLinkRateUpdatedEvent.parameters.push(
    new ethereum.EventParam(
      "nativeTokenLinkRate",
      ethereum.Value.fromUnsignedBigInt(nativeTokenLinkRate)
    )
  )

  return dacAggregatorNativeTokenLinkRateUpdatedEvent
}

export function createDACAggregator__PremiumPercentUpdatedEvent(
  premiumPercent: BigInt
): DACAggregator__PremiumPercentUpdated {
  let dacAggregatorPremiumPercentUpdatedEvent = changetype<
    DACAggregator__PremiumPercentUpdated
  >(newMockEvent())

  dacAggregatorPremiumPercentUpdatedEvent.parameters = new Array()

  dacAggregatorPremiumPercentUpdatedEvent.parameters.push(
    new ethereum.EventParam(
      "premiumPercent",
      ethereum.Value.fromUnsignedBigInt(premiumPercent)
    )
  )

  return dacAggregatorPremiumPercentUpdatedEvent
}

export function createDACAggregator__ProjectPingedEvent(
  projectAddress: Address,
  collaborator: Address
): DACAggregator__ProjectPinged {
  let dacAggregatorProjectPingedEvent = changetype<
    DACAggregator__ProjectPinged
  >(newMockEvent())

  dacAggregatorProjectPingedEvent.parameters = new Array()

  dacAggregatorProjectPingedEvent.parameters.push(
    new ethereum.EventParam(
      "projectAddress",
      ethereum.Value.fromAddress(projectAddress)
    )
  )
  dacAggregatorProjectPingedEvent.parameters.push(
    new ethereum.EventParam(
      "collaborator",
      ethereum.Value.fromAddress(collaborator)
    )
  )

  return dacAggregatorProjectPingedEvent
}

export function createDACAggregator__ProjectSubmittedEvent(
  project: ethereum.Tuple
): DACAggregator__ProjectSubmitted {
  let dacAggregatorProjectSubmittedEvent = changetype<
    DACAggregator__ProjectSubmitted
  >(newMockEvent())

  dacAggregatorProjectSubmittedEvent.parameters = new Array()

  dacAggregatorProjectSubmittedEvent.parameters.push(
    new ethereum.EventParam("project", ethereum.Value.fromTuple(project))
  )

  return dacAggregatorProjectSubmittedEvent
}

export function createDACAggregator__UpkeepGasLimitUpdatedEvent(
  upkeepGasLimit: BigInt
): DACAggregator__UpkeepGasLimitUpdated {
  let dacAggregatorUpkeepGasLimitUpdatedEvent = changetype<
    DACAggregator__UpkeepGasLimitUpdated
  >(newMockEvent())

  dacAggregatorUpkeepGasLimitUpdatedEvent.parameters = new Array()

  dacAggregatorUpkeepGasLimitUpdatedEvent.parameters.push(
    new ethereum.EventParam(
      "upkeepGasLimit",
      ethereum.Value.fromUnsignedBigInt(upkeepGasLimit)
    )
  )

  return dacAggregatorUpkeepGasLimitUpdatedEvent
}
