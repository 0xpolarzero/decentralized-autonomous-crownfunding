import React from "react"

export interface GlobalStore {
  connected: boolean
  setConnected: (connected: boolean) => void
  address: `0x${string}`
  setAddress: (address: `0x${string}`) => void
  currentNetwork: { name: string; id: number }
  setCurrentNetwork: (currentNetwork: { name: string; id: number }) => void
  contributorAccountAddress: `0x${string}`
  setContributorAccountAddress: (
    contributorAccountAddress: `0x${string}`
  ) => void
  hasContributorAccount: boolean
  setHasContributorAccount: (hasContributorAccount: boolean) => void
}
