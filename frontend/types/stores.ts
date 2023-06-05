import React from "react"

import { NetworkInfo } from "./network"

export interface GlobalStore {
  connected: boolean
  setConnected: (connected: boolean) => void
  address: `0x${string}`
  setAddress: (address: `0x${string}`) => void
  currentNetwork: NetworkInfo | null
  setCurrentNetwork: (currentNetwork: NetworkInfo | null) => void
  contributorAccountAddress: `0x${string}`
  setContributorAccountAddress: (
    contributorAccountAddress: `0x${string}`
  ) => void
  hasContributorAccount: boolean
  setHasContributorAccount: (hasContributorAccount: boolean) => void
}
