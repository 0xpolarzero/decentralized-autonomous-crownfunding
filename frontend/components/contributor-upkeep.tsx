import useGlobalStore from "@/stores/useGlobalStore"
import { useContractRead } from "wagmi"

import { UpkeepInfo } from "@/types/contributor-account"
import { DACContributorAccountAbi } from "@/config/constants/abis/DACContributorAccount"
import { Skeleton } from "@/components/ui/skeleton"

interface ContributorUpkeepComponentProps {}

const ContributorUpkeepComponent: React.FC<
  ContributorUpkeepComponentProps
> = () => {
  const {
    connected,
    contributorAccountAddress,
    hasContributorAccount,
    walletLoading,
  } = useGlobalStore((state) => ({
    connected: state.connected,
    contributorAccountAddress: state.contributorAccountAddress,
    hasContributorAccount: state.hasContributorAccount,
    walletLoading: state.loading,
  }))

  const { data: isUpkeepRegistered }: any = useContractRead({
    address: contributorAccountAddress,
    abi: DACContributorAccountAbi,
    functionName: "getUpkeep",
  })

  if (isUpkeepRegistered) console.log(isUpkeepRegistered)

  if (walletLoading) return <Skeleton className="w-full h-20" />
  if (!connected || !hasContributorAccount) return null

  return <div>CONTRIBUTOR UPKEEP</div>
}

export default ContributorUpkeepComponent
