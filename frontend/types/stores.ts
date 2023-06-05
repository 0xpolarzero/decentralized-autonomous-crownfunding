export interface GlobalStore {
  connected: boolean
  setConnected: (connected: boolean) => void
  address: `0x${string}`
  setAddress: (address: `0x${string}`) => void
  currentChain: { name: string; id: number }
  setCurrentChain: (currentChain: { name: string; id: number }) => void
  contributorAccountAddress: `0x${string}`
  setContributorAccountAddress: (
    contributorAccountAddress: `0x${string}`
  ) => void
  hasContributorAccount: boolean
  setHasContributorAccount: (hasContributorAccount: boolean) => void
}
