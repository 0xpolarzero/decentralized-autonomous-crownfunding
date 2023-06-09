import useGlobalStore from "@/stores/useGlobalStore"
import { LucideCreditCard, LucideTrash2 } from "lucide-react"
import { formatUnits } from "viem"
import { useContractRead } from "wagmi"

import { UpkeepInfo } from "@/types/contributor-account"
import { DACContributorAccountAbi } from "@/config/constants/abis/DACContributorAccount"
import { KeeperRegistry2_0Abi } from "@/config/constants/abis/KeeperRegistry2_0"
import { networkConfig } from "@/config/network"
import { Button } from "@/components/ui/button"
import { Dialog, DialogTrigger } from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"
import UpkeepCancelDialogComponent from "@/components/base-account-contributor/upkeep-cancel"
import UpkeepFundDialogComponent from "@/components/base-account-contributor/upkeep-fund"
import UpkeepInformationComponent from "@/components/base-account-contributor/upkeep-information"
import UpkeepPauseComponent from "@/components/base-account-contributor/upkeep-pause"
import CurrencyComponent from "@/components/ui-extended/currency"
import TooltipWithConditionComponent from "@/components/ui-extended/tooltip-with-condition"

interface UpkeepComponentProps {
  upkeep: UpkeepInfo | null
}

const UpkeepComponent: React.FC<UpkeepComponentProps> = ({ upkeep }) => {
  const { contributorAccountAddress, currentNetwork } = useGlobalStore(
    (state) => ({
      contributorAccountAddress: state.contributorAccountAddress,
      currentNetwork: state.currentNetwork,
    })
  )
  const networkInfo =
    currentNetwork || networkConfig.networks[networkConfig.defaultNetwork]

  // Upkeep id
  const { data: upkeepId } = useContractRead({
    address: contributorAccountAddress,
    abi: DACContributorAccountAbi,
    functionName: "getUpkeepId",
  })

  // Min balance for upkeep
  const { data: minBalance } = useContractRead({
    address: networkInfo.contracts.KEEPER_REGISTRY as `0x${string}`,
    abi: KeeperRegistry2_0Abi,
    functionName: "getMinBalanceForUpkeep",
    args: [upkeepId as bigint],
  })

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap justify-between items-center gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <Dialog>
            <TooltipWithConditionComponent
              shownContent={
                <DialogTrigger asChild>
                  <Button variant="secondary" disabled={upkeep?.canceled}>
                    <LucideCreditCard size={16} className="mr-2 h-4 w-4" /> Add
                    funds
                  </Button>
                </DialogTrigger>
              }
              tooltipContent="You can't add funds to your Upkeep if it is canceled"
              condition={upkeep?.canceled || false}
            />
            <UpkeepFundDialogComponent upkeepId={upkeepId as bigint} />
          </Dialog>
          <UpkeepPauseComponent
            upkeepId={upkeepId as bigint}
            paused={upkeep?.paused}
            canceled={upkeep?.canceled}
          />
          <Dialog>
            <TooltipWithConditionComponent
              shownContent={
                <DialogTrigger asChild>
                  <Button variant="secondary" disabled={upkeep?.paused}>
                    <LucideTrash2 className="mr-2 h-4 w-4" /> Cancel Upkeep
                  </Button>
                </DialogTrigger>
              }
              tooltipContent="You can't cancel your Upkeep if it is paused"
              condition={upkeep?.paused || false}
            />

            <UpkeepCancelDialogComponent
              upkeepId={upkeepId?.toString()}
              alreadyCanceled={upkeep?.canceled || false}
            />
          </Dialog>
        </div>
        <UpkeepInformationComponent
          upkeep={upkeep}
          id={upkeepId?.toString() || ""}
        />
      </div>

      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        Please try to keep a balance above{" "}
        {minBalance ? (
          <>
            <CurrencyComponent amount={Number(minBalance)} currency="link" />{" "}
            LINK
          </>
        ) : (
          <Skeleton className="h-4 w-20" />
        )}{" "}
        for your Upkeep to be able to run.
      </div>
    </div>
  )
}

export default UpkeepComponent
