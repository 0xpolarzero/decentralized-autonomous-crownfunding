"use client"

import { useEffect } from "react"
import useGlobalStore from "@/stores/useGlobalStore"
import { readContract } from "@wagmi/core"
import { ConnectKitButton } from "connectkit"
import { zeroAddress } from "viem"
import { useAccount, useNetwork } from "wagmi"

import { NetworkInfo, NetworkName } from "@/types/network"
import { abi, networkConfig, networkMapping } from "@/config/network"

export function ConnectButton() {
  const { address, isConnected } = useAccount()
  const { chain } = useNetwork()

  const {
    connected,
    currentNetwork,
    getContributorAccount,
    setConnected,
    setAddress,
    setCurrentNetwork,
    setContributorAccountAddress,
    setHasContributorAccount,
    setLoading,
  } = useGlobalStore((state) => ({
    connected: state.connected,
    currentNetwork: state.currentNetwork,
    getContributorAccount: state.getContributorAccount,
    setConnected: state.setConnected,
    setAddress: state.setAddress,
    setCurrentNetwork: state.setCurrentNetwork,
    setContributorAccountAddress: state.setContributorAccountAddress,
    setHasContributorAccount: state.setHasContributorAccount,
    setLoading: state.setLoading,
  }))

  // Address & connected status
  useEffect(() => {
    if (address && isConnected) {
      setConnected(true)
      setAddress(address || "0x")
    } else {
      setConnected(false)
      setAddress("0x")
    }
  }, [isConnected, address, setAddress, setConnected])

  // Chain
  useEffect(() => {
    if (chain) {
      setCurrentNetwork(
        // Is the chain id in the network config?
        networkConfig.networks[chain.network as NetworkName]
          ? networkConfig.networks[chain.network as NetworkName]
          : // If not set the default network
            networkConfig.networks[networkConfig.defaultNetwork]
      )
    } else {
      setCurrentNetwork(null)
    }
  }, [chain, setCurrentNetwork])

  // Contributor account
  useEffect(() => {
    if (currentNetwork) getContributorAccount()
  }, [currentNetwork])

  return <ConnectKitButton />
}
