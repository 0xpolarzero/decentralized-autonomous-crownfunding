import useGlobalStore from "@/stores/useGlobalStore"

import { UpkeepInfo } from "@/types/contributor-account"
import { Skeleton } from "@/components/ui/skeleton"
import UpkeepComponent from "@/components/base-account-contributor/upkeep"
import UpkeepCreateComponent from "@/components/base-account-contributor/upkeep-create"

interface BaseComponentProps {
  upkeepInfo: UpkeepInfo
  upkeepId: bigint | null
  isUpkeepRegistered: boolean
  refetchUpkeepInfo: () => void
  refetchUpkeepId: () => void
}

const BaseComponent: React.FC<BaseComponentProps> = ({
  upkeepInfo,
  upkeepId,
  isUpkeepRegistered,
  refetchUpkeepInfo,
  refetchUpkeepId,
}) => {
  const { connected, hasContributorAccount, walletLoading } = useGlobalStore(
    (state) => ({
      connected: state.connected,
      hasContributorAccount: state.hasContributorAccount,
      walletLoading: state.loading,
    })
  )

  if (walletLoading) return <Skeleton className="h-20 w-full" />
  if (!connected || !hasContributorAccount) return null

  if (!isUpkeepRegistered)
    return (
      <UpkeepCreateComponent
        refetchUpkeepId={refetchUpkeepId}
        refetchUpkeepInfo={refetchUpkeepInfo}
      />
    )

  return (
    <div className="flex flex-col gap-2">
      <UpkeepComponent
        upkeepId={upkeepId}
        upkeep={{
          ...upkeepInfo,
          canceled:
            upkeepInfo.maxValidBlocknumber !==
            BigInt(4_294_967_295) /* max uint32 */,
        }}
        refetchUpkeep={refetchUpkeepInfo}
      />
    </div>
  )
}

export default BaseComponent
