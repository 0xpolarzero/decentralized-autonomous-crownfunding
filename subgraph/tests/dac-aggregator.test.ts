import {
  assert,
  describe,
  test,
  clearStore,
  beforeAll,
  afterAll
} from "matchstick-as/assembly/index"
import { Address, BigInt } from "@graphprotocol/graph-ts"
import { DACAggregator__AllContributionsCanceled } from "../generated/schema"
import { DACAggregator__AllContributionsCanceled as DACAggregator__AllContributionsCanceledEvent } from "../generated/DACAggregator/DACAggregator"
import { handleDACAggregator__AllContributionsCanceled } from "../src/dac-aggregator"
import { createDACAggregator__AllContributionsCanceledEvent } from "./dac-aggregator-utils"

// Tests structure (matchstick-as >=0.5.0)
// https://thegraph.com/docs/en/developer/matchstick/#tests-structure-0-5-0

describe("Describe entity assertions", () => {
  beforeAll(() => {
    let accountContract = Address.fromString(
      "0x0000000000000000000000000000000000000001"
    )
    let newDACAggregator__AllContributionsCanceledEvent = createDACAggregator__AllContributionsCanceledEvent(
      accountContract
    )
    handleDACAggregator__AllContributionsCanceled(
      newDACAggregator__AllContributionsCanceledEvent
    )
  })

  afterAll(() => {
    clearStore()
  })

  // For more test scenarios, see:
  // https://thegraph.com/docs/en/developer/matchstick/#write-a-unit-test

  test("DACAggregator__AllContributionsCanceled created and stored", () => {
    assert.entityCount("DACAggregator__AllContributionsCanceled", 1)

    // 0xa16081f360e3847006db660bae1c6d1b2e17ec2a is the default address used in newMockEvent() function
    assert.fieldEquals(
      "DACAggregator__AllContributionsCanceled",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "accountContract",
      "0x0000000000000000000000000000000000000001"
    )

    // More assert options:
    // https://thegraph.com/docs/en/developer/matchstick/#asserts
  })
})
