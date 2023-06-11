import { readContract } from "@wagmi/core"
import { zeroAddress } from "viem"
import { create } from "zustand"

import { NetworkInfo } from "@/types/network"
import { GlobalStore } from "@/types/stores"
import { DACAggregatorAbi } from "@/config/constants/abis/DACAggregator"
import { networkConfig, networkMapping } from "@/config/network"

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

  getContributorAccount: async () => {
    const chainId =
      get().currentNetwork?.chainId.toString() ||
      networkConfig.networks[networkConfig.defaultNetwork].chainId.toString()

    const resetContributorAccount = () => {
      set({
        contributorAccountAddress: "0x",
        hasContributorAccount: false,
      })
    }

    try {
      if (!networkMapping[chainId]) {
        resetContributorAccount()
        return
      }

      const data = await readContract({
        address: networkMapping[chainId]["DACAggregator"][0] as `0x${string}`,
        abi: DACAggregatorAbi,
        functionName: "getContributorAccount",
        args: [get().address],
      })

      if (data && data !== zeroAddress) {
        set({
          contributorAccountAddress: data as `0x${string}`,
          hasContributorAccount: true,
        })
      } else {
        resetContributorAccount()
      }
    } catch (err) {
      console.log(err)
      resetContributorAccount()
    }

    set({ loading: false })
  },

  // Loading
  loading: true,
  setLoading: (loading: boolean) => set({ loading }),

  // Refresh
  shouldRefresh: false,
  refresh: () => set({ shouldRefresh: true }),
  resetRefresh: () => set({ shouldRefresh: false }),
}))
