import useGlobalStore from "@/stores/useGlobalStore"
import { zeroAddress } from "viem"
import { useContractRead } from "wagmi"

import { UpkeepInfo } from "@/types/contributor-account"
import { DACContributorAccountAbi } from "@/config/constants/abis/DACContributorAccount"
import { KeeperRegistry2_0Abi } from "@/config/constants/abis/KeeperRegistry2_0"
import { networkConfig } from "@/config/network"
import { Skeleton } from "@/components/ui/skeleton"
import UpkeepCreateComponent from "@/components/base-account-contributor/upkeep-create"

import UpkeepComponent from "./upkeep"

interface BaseComponentProps {}

const BaseComponent: React.FC<BaseComponentProps> = () => {
  const {
    connected,
    contributorAccountAddress,
    currentNetwork,
    hasContributorAccount,
    walletLoading,
  } = useGlobalStore((state) => ({
    connected: state.connected,
    contributorAccountAddress: state.contributorAccountAddress,
    currentNetwork: state.currentNetwork,
    hasContributorAccount: state.hasContributorAccount,
    walletLoading: state.loading,
  }))

  const { data: upkeepData } = useContractRead({
    address: contributorAccountAddress,
    abi: DACContributorAccountAbi,
    functionName: "getUpkeep",
  })
  const upkeepInfo = upkeepData as UpkeepInfo

  if (walletLoading) return <Skeleton className="w-full h-20" />
  if (!connected || !hasContributorAccount) return null

  if (!upkeepInfo || upkeepInfo.admin === zeroAddress)
    return <UpkeepCreateComponent />

  return (
    <div className="flex flex-col gap-2">
      <UpkeepComponent upkeep={upkeepInfo} />
    </div>
  )
}

export default BaseComponent
