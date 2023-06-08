import { create } from "zustand"

import { NetworkInfo } from "@/types/network"
import { GlobalStore } from "@/types/stores"

export default create<GlobalStore>((set, get) => ({
  // Wallet
  connected: false,
  setConnected: (connected: boolean) => set({ connected }),
  address: "0x",
  setAddress: (address: `0x${string}`) => set({ address }),

  // Network
  currentNetwork: null,
  setCurrentNetwork: (currentNetwork: NetworkInfo | null) =>
    set({ currentNetwork }),

  // Contributor account
  contributorAccountAddress: "0x",
  setContributorAccountAddress: (contributorAccountAddress: `0x${string}`) =>
    set({ contributorAccountAddress }),
  hasContributorAccount: false,
  setHasContributorAccount: (hasContributorAccount: boolean) =>
    set({ hasContributorAccount }),

  // Loading
  loading: true,
  setLoading: (loading: boolean) => set({ loading }),
}))
