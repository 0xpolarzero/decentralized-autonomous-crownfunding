"use client"

import { useEffect } from "react"
import useGlobalStore from "@/stores/useGlobalStore"
import { ConnectKitButton } from "connectkit"
import { useAccount, useNetwork } from "wagmi"

import { NetworkName } from "@/types/network"
import { networkConfig } from "@/config/network"
import { Button } from "@/components/ui/button"

export function ConnectButton() {
  const { address, isConnected } = useAccount()
  const { chain } = useNetwork()

  const {
    currentNetwork,
    getContributorAccount,
    setConnected,
    setAddress,
    setCurrentNetwork,
  } = useGlobalStore((state) => ({
    currentNetwork: state.currentNetwork,
    getContributorAccount: state.getContributorAccount,
    setConnected: state.setConnected,
    setAddress: state.setAddress,
    setCurrentNetwork: state.setCurrentNetwork,
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

  return (
    <ConnectKitButton.Custom>
      {({ isConnected, show, truncatedAddress, ensName }) => {
        return (
          <Button
            variant="secondary"
            className="whitespace-nowrap"
            onClick={show}
          >
            {isConnected ? ensName ?? truncatedAddress : "Connect Wallet"}
          </Button>
        )
      }}
    </ConnectKitButton.Custom>
  )
}
