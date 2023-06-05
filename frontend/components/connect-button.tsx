"use client"

import { useEffect } from "react"
import useGlobalStore from "@/stores/useGlobalStore"
import { readContract } from "@wagmi/core"
import { ConnectKitButton } from "connectkit"
import { useAccount, useContractRead, useNetwork } from "wagmi"

import { abi, networkMapping } from "@/config/network"

export function ConnectButton() {
  const { address } = useAccount()
  const { chain } = useNetwork()

  const {
    setConnected,
    setAddress,
    setCurrentChain,
    setContributorAccountAddress,
    setHasContributorAccount,
  } = useGlobalStore((state) => ({
    setConnected: state.setConnected,
    setAddress: state.setAddress,
    setCurrentChain: state.setCurrentChain,
    setContributorAccountAddress: state.setContributorAccountAddress,
    setHasContributorAccount: state.setHasContributorAccount,
  }))

  const getContributorAccount = async () => {
    const chainIdString = chain?.id.toString() || "0"
    if (!networkMapping[chainIdString]) return

    const contractAddress: `0x${string}` =
      networkMapping[chainIdString]["DACAggregator"][0]

    if (!contractAddress) return // Should not happen but just in case

    const data = await readContract({
      address: contractAddress,
      abi: abi.dacAggregator,
      functionName: "getContributorAccount",
      args: [address],
    })

    if (data) {
      setHasContributorAccount(true)
      setContributorAccountAddress(data as `0x${string}`)
    } else {
      setHasContributorAccount(false)
      setContributorAccountAddress("0x")
    }
  }

  // Address & connected status
  useEffect(() => {
    if (address) {
      setConnected(true)
      setAddress(address || "0x")
      getContributorAccount()
    } else {
      setConnected(false)
      setAddress("0x")
    }
  }, [address])

  // Chain
  useEffect(() => {
    if (chain) {
      setCurrentChain({ name: chain.name, id: chain.id })
      getContributorAccount()
    } else {
      setCurrentChain({ name: "", id: 0 })
    }
  }, [chain])

  return <ConnectKitButton />
}
