import React, { useState } from "react"
import Link from "next/link"
import useGlobalStore from "@/stores/useGlobalStore"
import { fetchBlockNumber, waitForTransaction } from "@wagmi/core"
import { Loader2 } from "lucide-react"
import { TransactionReceipt } from "viem"
import { useContractWrite } from "wagmi"

import { KeeperRegistry2_0Abi } from "@/config/constants/abis/KeeperRegistry2_0"
import { networkConfig } from "@/config/network"
import { Button } from "@/components/ui/button"
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/components/ui/use-toast"
import TimerComponent from "@/components/ui-extended/timer"
import TooltipWithConditionComponent from "@/components/ui-extended/tooltip-with-condition"

interface UpkeepCancelDialogComponentProps {
  upkeepId: string | undefined
  alreadyCanceled: boolean
}

const UpkeepCancelDialogComponent: React.FC<
  UpkeepCancelDialogComponentProps
> = ({ upkeepId, alreadyCanceled }) => {
  const { address, currentNetwork } = useGlobalStore((state) => ({
    address: state.address,
    currentNetwork: state.currentNetwork,
  }))

  const networkInfo =
    currentNetwork || networkConfig.networks[networkConfig.defaultNetwork]

  const { toast } = useToast()

  const [isProcessingTransaction, setIsProcessingTransaction] =
    useState<boolean>(false)
  const [processingMessage, setProcessingMessage] = useState<string>("")
  const [upkeepCanceled, setUpkeepCanceled] = useState<boolean>(alreadyCanceled)
  const [canWithdrawFunds, setCanWithdrawFunds] =
    useState<boolean>(alreadyCanceled)
  const [targetBlockNumber, setTargetBlockNumber] = useState<bigint>(BigInt(0))
  const [targetTimestampExpected, setTargetTimestampExpected] =
    useState<number>(0)

  const { isLoading: isCancelingUpkeep, write: cancelUpkeep } =
    useContractWrite({
      address: networkInfo.contracts.KEEPER_REGISTRY as `0x${string}`,
      abi: KeeperRegistry2_0Abi,
      functionName: "cancelUpkeep",
      args: [BigInt(upkeepId || 0)],

      onSuccess: async (tx) => {
        setIsProcessingTransaction(true)
        setProcessingMessage("Canceling Upkeep...")

        const receipt: TransactionReceipt = await waitForTransaction({
          hash: tx.hash,
          confirmations: 5,
        })
        console.log(receipt)

        if (receipt.status === "success") {
          setUpkeepCanceled(true)
          setTargetBlockNumber(receipt.blockNumber + BigInt(51))
          setTargetTimestampExpected(
            new Date().getTime() + 51 * networkInfo.blockDuration
          )

          // Set a timeout to check if the block number has been reached
          setTimeout(async () => {
            const currentBlockNumber = await fetchBlockNumber()
            if (currentBlockNumber >= targetBlockNumber) {
              setCanWithdrawFunds(true)
            }
          }, 51 * networkInfo.blockDuration * 1000)

          toast({
            title: "Upkeep canceled",
            description: (
              <>
                <p>
                  Your Upkeep was successfully canceled. Please wait for 50
                  blocks to withdraw your funds.
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
        setProcessingMessage("")
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

  const { isLoading: isWithdrawingFunds, write: withdrawFunds } =
    useContractWrite({
      address: networkInfo.contracts.KEEPER_REGISTRY as `0x${string}`,
      abi: KeeperRegistry2_0Abi,
      functionName: "withdrawFunds",
      args: [BigInt(upkeepId || 0), address],

      onSuccess: async (tx) => {
        setIsProcessingTransaction(true)
        setProcessingMessage("Withdrawing remaining funds...")

        const receipt: TransactionReceipt = await waitForTransaction({
          hash: tx.hash,
          confirmations: 5,
        })
        console.log(receipt)
        if (receipt.status === "success") {
          toast({
            title: "Funds withdrawn",
            description: (
              <>
                <p>
                  Your LINK were sucessfully withdrawn and sent back to your
                  wallet.
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
        setProcessingMessage("")
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

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Cancel Upkeep</DialogTitle>
        <DialogDescription className="flex flex-col gap-2">
          <p className="mt-2 text-justify">
            This will <b>cancel your Upkeep</b>, allow you to{" "}
            <b>withdraw your remaining funds</b> and stop the automation.
          </p>
          <p className="text-justify">
            You will need to <b>wait for 50 blocks</b> after cancelation before
            you can withdraw your funds.
          </p>
          <p className="text-justify">
            If you can&apos;t withdraw your funds although you&apos;ve already
            canceled your Upkeep, you can visit the{" "}
            <Link
              className="underline"
              href={`https://automation.chain.link/${networkInfo.name.toLowerCase()}/${upkeepId}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              Chainlink Automation UI
            </Link>{" "}
            to withdraw.
          </p>

          {upkeepCanceled && targetTimestampExpected ? (
            <p className="text-justify">
              You will be able to withdraw your funds in:{" "}
              <b>
                <TimerComponent targetTimestamp={targetTimestampExpected} />
              </b>
              .
            </p>
          ) : null}
          <Separator className="my-2" />
        </DialogDescription>
      </DialogHeader>
      <DialogFooter>
        <div className="flex w-full flex-col gap-3">
          {isProcessingTransaction ? (
            <span className="justify-self-start text-sm text-gray-400">
              {processingMessage}
            </span>
          ) : null}
          <div className="flex items-center justify-between gap-2">
            <TooltipWithConditionComponent
              shownContent={
                <Button
                  variant={upkeepCanceled ? "secondary" : "default"}
                  disabled={isCancelingUpkeep || upkeepCanceled}
                  onClick={() => cancelUpkeep()}
                >
                  {isCancelingUpkeep ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
                  Cancel Upkeep
                </Button>
              }
              tooltipContent="Your Upkeep is already canceled"
              condition={upkeepCanceled}
            />
            <TooltipWithConditionComponent
              shownContent={
                <Button
                  variant={upkeepCanceled ? "default" : "secondary"}
                  disabled={
                    isWithdrawingFunds || !upkeepCanceled || !canWithdrawFunds
                  }
                  onClick={() => withdrawFunds()}
                >
                  {isWithdrawingFunds ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
                  Withdraw funds
                </Button>
              }
              tooltipContent="You need to cancel your Upkeep and wait for 50 blocks first"
              condition={!upkeepCanceled || !canWithdrawFunds}
            />
          </div>
        </div>
      </DialogFooter>
    </DialogContent>
  )
}

export default UpkeepCancelDialogComponent
