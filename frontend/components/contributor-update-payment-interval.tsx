import { useEffect, useState } from "react"
import Link from "next/link"
import useGlobalStore from "@/stores/useGlobalStore"
import { Separator } from "@radix-ui/react-dropdown-menu"
import { waitForTransaction } from "@wagmi/core"
import { Loader2, LucideTimer } from "lucide-react"
import { TransactionReceipt } from "viem"
import { useContractWrite } from "wagmi"

import { DACContributorAccountAbi } from "@/config/constants/abis/DACContributorAccount"
import { networkConfig } from "@/config/network"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Slider } from "@/components/ui/slider"
import { useToast } from "@/components/ui/use-toast"
import DurationComponent from "@/components/ui-extended/duration"
import InfoComponent from "@/components/ui-extended/info"

export default function ContributorUpdatePaymentInterval({
  currentPaymentInterval,
  refetch,
}: {
  currentPaymentInterval: number
  refetch: () => void
}) {
  const { contributorAccountAddress, currentNetwork } = useGlobalStore(
    (state) => ({
      contributorAccountAddress: state.contributorAccountAddress,
      currentNetwork: state.currentNetwork,
    })
  )

  const { toast } = useToast()

  const networkInfo =
    currentNetwork || networkConfig.networks[networkConfig.defaultNetwork]

  const [isProcessingTransaction, setIsProcessingTransaction] =
    useState<boolean>(false)
  const [paymentIntervalDays, setPaymentIntervalDays] = useState<number>(604800)
  const [paymentIntervalHours, setPaymentIntervalHours] = useState<number>(0)
  useEffect(() => {
    setPaymentIntervalDays(
      currentPaymentInterval - (currentPaymentInterval % 86400)
    )
    setPaymentIntervalHours(currentPaymentInterval % 86400)
  }, [currentPaymentInterval])

  const { isLoading: isUpdatingInterval, write: updateInterval } =
    useContractWrite({
      address: contributorAccountAddress,
      abi: DACContributorAccountAbi,
      functionName: "setUpkeepInterval",
      args: [paymentIntervalDays + paymentIntervalHours],

      onSuccess: async (tx) => {
        setIsProcessingTransaction(true)

        const receipt: TransactionReceipt = await waitForTransaction({
          hash: tx.hash,
          confirmations: networkInfo.confirmations || 3,
        })
        console.log(receipt)

        if (receipt.status === "success") {
          toast({
            title: "Interval updated",
            description: (
              <>
                <p>The Upkeep interval was successfully updated.</p>
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

          refetch()
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

  useEffect(() => {
    if (paymentIntervalDays === 0 && paymentIntervalHours === 0)
      setPaymentIntervalHours(3600)
  }, [paymentIntervalDays, paymentIntervalHours])

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="secondary" className="gap-2">
          <div className="flex">
            <LucideTimer className="mr-2 h-4 w-4" />
            Update payment interval
          </div>
          <div className="font-semibold text-muted-foreground">
            (
            <DurationComponent
              startTimestamp={1} // Just so it's not 0
              endTimestamp={currentPaymentInterval * 1000 + 1}
            />
            )
          </div>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update payment interval</DialogTitle>
          <DialogDescription className="flex flex-col gap-2">
            <p className="mt-2 text-justify">
              This will update the interval between automatic payments,
              triggered by the Chainlink Automation.
            </p>
            <p>
              You can change this interval with a value{" "}
              <b>between 1 hour and 30 days</b>.
            </p>
            <Separator className="my-2" />
            <span className="mb-2 flex items-center gap-2">
              Payment interval
              <InfoComponent content="The interval between automatic payments." />
            </span>
            <div className="grid grid-cols-[1fr,auto] gap-4">
              <Slider
                value={[paymentIntervalDays]}
                min={0}
                max={2592000} // 30 days
                step={86400} // 1 day
                onValueChange={([value]) => setPaymentIntervalDays(value)}
              />
              <b>
                {paymentIntervalDays / 86400}{" "}
                {paymentIntervalDays / 86400 > 1 ? "days" : "day"}
              </b>
              <Slider
                value={[paymentIntervalHours]}
                min={paymentIntervalDays === 0 ? 3600 : 0}
                max={82800}
                step={3600}
                onValueChange={([value]) => setPaymentIntervalHours(value)}
              />
              <b>
                {paymentIntervalHours / 3600}{" "}
                {paymentIntervalHours / 3600 > 1 ? "hours" : "hour"}
              </b>
            </div>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <div
            className={`flex grow items-center ${
              isProcessingTransaction ? "justify-between" : "justify-end"
            }`}
          >
            {isProcessingTransaction ? (
              <span className="justify-self-start text-sm text-gray-400">
                The interval is being updated...
              </span>
            ) : null}
            <Button
              type="submit"
              disabled={isUpdatingInterval}
              onClick={() => updateInterval()}
            >
              {isUpdatingInterval ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Update
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
