"use client"

import { useEffect } from "react"
import useGlobalStore from "@/stores/useGlobalStore"
import { readContract } from "@wagmi/core"
import { ConnectKitButton } from "connectkit"
import { zeroAddress } from "viem"
import { useAccount, useContractRead, useNetwork } from "wagmi"

import { abi, networkMapping } from "@/config/network"

export function ConnectButton() {
  const { address, isConnected } = useAccount()
  const { chain } = useNetwork()

  const {
    connected,
    currentChain,
    contributorAccountAddress,
    setConnected,
    setAddress,
    setCurrentChain,
    setContributorAccountAddress,
    setHasContributorAccount,
  } = useGlobalStore((state) => ({
    connected: state.connected,
    currentChain: state.currentChain,
    contributorAccountAddress: state.contributorAccountAddress,
    setConnected: state.setConnected,
    setAddress: state.setAddress,
    setCurrentChain: state.setCurrentChain,
    setContributorAccountAddress: state.setContributorAccountAddress,
    setHasContributorAccount: state.setHasContributorAccount,
  }))

  const getContributorAccount = async () => {
    console.log("here")
    try {
      console.log("and here")

      const chainIdString = chain?.id.toString() || "0"
      if (!networkMapping[chainIdString]) {
        resetContributorAccount()
        return
      }

      const contractAddress: `0x${string}` =
        networkMapping[chainIdString]["DACAggregator"][0]

      if (!contractAddress) return // Should not happen but just in case

      const data = await readContract({
        address: contractAddress,
        abi: abi.dacAggregator,
        functionName: "getContributorAccount",
        args: [address],
      })

      console.log(
        "contract address",
        contractAddress,
        "contribiutor account",
        contributorAccountAddress
      )

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
  }

  const resetContributorAccount = () => {
    setHasContributorAccount(false)
    setContributorAccountAddress("0x")
  }

  // Address & connected status
  useEffect(() => {
    if (address && isConnected) {
      console.log("now connected")
      setConnected(true)
      setAddress(address || "0x")
    } else {
      console.log("now disconnected")
      setConnected(false)
      setAddress("0x")
    }
    console.log("switched address")
  }, [isConnected])

  // Chain
  useEffect(() => {
    if (chain) {
      console.log("now on chain")
      setCurrentChain({ name: chain.name, id: chain.id })
    } else {
      console.log("now off chain")
      setCurrentChain({ name: "", id: 0 })
    }
    console.log("switched chain")
  }, [chain])

  // Contributor account
  useEffect(() => {
    getContributorAccount()
    console.log("contributor account changed", contributorAccountAddress)
  }, [connected, currentChain])

  return <ConnectKitButton />
}
