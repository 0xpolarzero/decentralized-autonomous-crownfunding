"use client"

import { useEffect } from "react"
import useGlobalStore from "@/stores/useGlobalStore"
import { readContract } from "@wagmi/core"
import { ConnectKitButton } from "connectkit"
import { zeroAddress } from "viem"
import { useAccount, useContractRead, useNetwork } from "wagmi"

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

  const resetContributorAccount = () => {
    setHasContributorAccount(false)
    setContributorAccountAddress("0x")
  }

  // Address & connected status
  useEffect(() => {
    if (address && isConnected) {
      setConnected(true)
      setAddress(address || "0x")
    } else {
      setConnected(false)
      setAddress("0x")
    }
  }, [isConnected])

  // Chain
  useEffect(() => {
    if (chain) {
      setCurrentNetwork(
        networkConfig.networks[
          chain.network as keyof typeof networkConfig.networks
        ]
      )
    } else {
      setCurrentNetwork(null)
    }
  }, [chain])

  // Contributor account
  useEffect(() => {
    getContributorAccount()
  }, [connected, currentNetwork])

  return <ConnectKitButton />
}
