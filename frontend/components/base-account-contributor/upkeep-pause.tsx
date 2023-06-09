import React, { useState } from "react"
import Link from "next/link"
import useGlobalStore from "@/stores/useGlobalStore"
import { waitForTransaction } from "@wagmi/core"
import { Loader2 } from "lucide-react"
import { useContractWrite } from "wagmi"

import { KeeperRegistry2_0Abi } from "@/config/constants/abis/KeeperRegistry2_0"
import { networkConfig } from "@/config/network"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/components/ui/use-toast"
import TooltipComponent from "@/components/ui-extended/tooltip"

interface UpkeepPauseComponentProps {
  upkeepId: bigint
  paused: boolean | undefined
}

const UpkeepPauseComponent: React.FC<UpkeepPauseComponentProps> = ({
  upkeepId,
  paused,
}) => {
  const { toast } = useToast()

  const currentNetwork = useGlobalStore((state) => state.currentNetwork)

  const networkInfo =
    currentNetwork || networkConfig.networks[networkConfig.defaultNetwork]

  const [isProcessingTransaction, setIsProcessingTransaction] =
    useState<boolean>(false)

  const { isLoading: isUpdatingPauseUpkeep, write: updatePauseUpkeep } =
    useContractWrite({
      address: networkInfo.contracts.KEEPER_REGISTRY as `0x${string}`,
      abi: KeeperRegistry2_0Abi,
      functionName: paused ? "unpauseUpkeep" : "pauseUpkeep",
      args: [upkeepId],

      onSuccess: async (tx) => {
        setIsProcessingTransaction(true)

        const receipt = await waitForTransaction({
          hash: tx.hash,
          confirmations: 5,
        })
        console.log(receipt)

        if (receipt.status === "success") {
          toast({
            title: paused ? "Upkeep unpaused" : "Upkeep paused",
            description: (
              <>
                <p>
                  Your Upkeep was successfully {paused ? "unpaused" : "paused"}.
                </p>
                <p>
                  <Link
                    href={`${networkInfo.blockExplorer.url}tx/${tx.hash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline"
                  >
                    See on block explorer
                  </Link>
                </p>
              </>
            ),
          })
        } else {
          toast({
            variant: "destructive",
            title: "Something went wrong",
            description: "Please try again.",
          })
        }

        setIsProcessingTransaction(false)
      },
      onError: (err) => {
        toast({
          variant: "destructive",
          title: "Something went wrong",
          description: "Please try again.",
        })
        console.error(err)
      },
    })

  if (paused === undefined) return <Skeleton className="w-24 h-10" />

  return (
    <TooltipComponent
      shownContent={
        <Button
          variant="secondary"
          disabled={isUpdatingPauseUpkeep}
          onClick={() => updatePauseUpkeep()}
        >
          {isProcessingTransaction ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : null}
          {paused ? "Unpause" : "Pause"}
        </Button>
      }
      tooltipContent={
        paused
          ? "This will unpause your Upkeep, meaning that it will start running again at the configured payment interval"
          : "This will pause your Upkeep, meaning that it will stop running until you unpause it again."
      }
    />
  )
}

export default UpkeepPauseComponent
