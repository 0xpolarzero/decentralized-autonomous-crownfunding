import { useEffect, useState } from "react"
import Link from "next/link"
import useGlobalStore from "@/stores/useGlobalStore"
import { formatUnits } from "viem"
import { useContractRead, useContractWrite } from "wagmi"

import { UpkeepInfo } from "@/types/contributor-account"
import { DACContributorAccountAbi } from "@/config/constants/abis/DACContributorAccount"
import { KeeperRegistry2_0Abi } from "@/config/constants/abis/KeeperRegistry2_0"
import { LinkTokenAbi } from "@/config/constants/abis/LinkToken"
import { networkConfig } from "@/config/network"
import useCopyToClipboard from "@/hooks/copy-to-clipboard"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/components/ui/use-toast"

import CurrencyComponent from "../ui-extended/currency"
import InfoComponent from "../ui-extended/info"
import { Dialog, DialogTrigger } from "../ui/dialog"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import UpkeepCancelDialogComponent from "./upkeep-cancel"
import UpkeepFundDialogComponent from "./upkeep-fund"
import UpkeepInformationComponent from "./upkeep-information"
import UpkeepPauseComponent from "./upkeep-pause"

const formatAmount = (value: number) =>
  Number(Number(formatUnits(BigInt(value), 18)).toFixed(4))

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
        <UpkeepInformationComponent
          upkeep={upkeep}
          id={upkeepId?.toString() || ""}
        />
        <div className="flex flex-wrap items-center gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button>Add funds</Button>
            </DialogTrigger>
            <UpkeepFundDialogComponent upkeepId={upkeepId as bigint} />
          </Dialog>
          <UpkeepPauseComponent
            upkeepId={upkeepId as bigint}
            paused={upkeep?.paused}
          />
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="secondary">Cancel Upkeep</Button>
            </DialogTrigger>
            <UpkeepCancelDialogComponent upkeepId={upkeepId as bigint} />
          </Dialog>
        </div>
      </div>
      <div className="flex items-center gap-2">
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
    </div>
  )
}

export default UpkeepComponent
