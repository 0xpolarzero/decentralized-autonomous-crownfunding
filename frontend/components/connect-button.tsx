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
    setConnected,
    setAddress,
    setCurrentNetwork,
    setContributorAccountAddress,
    setHasContributorAccount,
    setLoading,
  } = useGlobalStore((state) => ({
    connected: state.connected,
    currentNetwork: state.currentNetwork,
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
    const resetContributorAccount = () => {
      setHasContributorAccount(false)
      setContributorAccountAddress("0x")
    }

    const getContributorAccount = async () => {
      try {
        const chainIdString = chain?.id.toString() || "0"
        if (!networkMapping[chainIdString]) {
          resetContributorAccount()
          return
        }

        const data = await readContract({
          address: networkMapping[chainIdString][
            "DACAggregator"
          ][0] as `0x${string}`,
          abi: abi.dacAggregator,
          functionName: "getContributorAccount",
          args: [address],
        })

        if (data && data !== zeroAddress) {
          setHasContributorAccount(true)
          setContributorAccountAddress(data as `0x${string}`)
        } else {
          resetContributorAccount()
        }
      } catch (err) {
        console.log(err)
        resetContributorAccount()
      }

      setLoading(false)
    }

    getContributorAccount()
  }, [
    connected,
    currentNetwork,
    address,
    chain?.id,
    setContributorAccountAddress,
    setHasContributorAccount,
    setLoading,
  ])

  return <ConnectKitButton />
}
