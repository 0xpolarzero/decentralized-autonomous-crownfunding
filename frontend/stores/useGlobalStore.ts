import { create } from "zustand"

import { GlobalStore } from "@/types/stores"

export default create<GlobalStore>((set, get) => ({
  // Wallet
  connected: false,
  setConnected: (connected: boolean) => set({ connected }),
  address: "0x",
  setAddress: (address: `0x${string}`) => set({ address }),

  // Network
  currentNetwork: { name: "", id: 0 },
  setCurrentNetwork: (currentNetwork: { name: string; id: number }) =>
    set({ currentNetwork }),

  // Contributor account
  contributorAccountAddress: "0x",
  setContributorAccountAddress: (contributorAccountAddress: `0x${string}`) =>
    set({ contributorAccountAddress }),
  hasContributorAccount: false,
  setHasContributorAccount: (hasContributorAccount: boolean) =>
    set({ hasContributorAccount }),
}))
