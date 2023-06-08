import useGlobalStore from "@/stores/useGlobalStore"

import { Skeleton } from "@/components/ui/skeleton"

interface ContributorUpkeepComponentProps {}

const ContributorUpkeepComponent: React.FC<
  ContributorUpkeepComponentProps
> = () => {
  const { connected, hasContributorAccount, walletLoading } = useGlobalStore(
    (state) => ({
      connected: state.connected,
      hasContributorAccount: state.hasContributorAccount,
      walletLoading: state.loading,
    })
  )

  if (walletLoading) return <Skeleton className="w-full h-20" />
  if (!connected || !hasContributorAccount) return null

  return <div>CONTRIBUTOR UPKEEP</div>
}

export default ContributorUpkeepComponent
