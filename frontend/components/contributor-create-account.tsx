import { useEffect, useState } from "react"
import Link from "next/link"
import useGlobalStore from "@/stores/useGlobalStore"
import { Separator } from "@radix-ui/react-dropdown-menu"
import { waitForTransaction } from "@wagmi/core"
import { Loader2 } from "lucide-react"
import { TransactionReceipt } from "viem"
import { useContractWrite } from "wagmi"

import { DACAggregatorAbi } from "@/config/constants/abis/DACAggregator"
import { networkConfig, networkMapping } from "@/config/network"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { useToast } from "@/components/ui/use-toast"
import InfoComponent from "@/components/ui-extended/info"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog"

export default function ContributorCreateAccount() {
  const { currentNetwork, getContributorAccount } = useGlobalStore((state) => ({
    currentNetwork: state.currentNetwork,
    getContributorAccount: state.getContributorAccount,
  }))

  const { toast } = useToast()

  const networkInfo =
    currentNetwork || networkConfig.networks[networkConfig.defaultNetwork]

  const [isProcessingTransaction, setIsProcessingTransaction] =
    useState<boolean>(false)
  const [paymentIntervalDays, setPaymentIntervalDays] = useState<number>(604800) // 7 days
  const [paymentIntervalHours, setPaymentIntervalHours] = useState<number>(0)

  const { isLoading: isCreatingAccount, write: createAccount } =
    useContractWrite({
      address: networkMapping[networkInfo.chainId]["DACAggregator"][0],
      abi: DACAggregatorAbi,
      functionName: "createContributorAccount",
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
            title: "Account created",
            description: (
              <>
                <p>Your contributor account was successfully created.</p>
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

          getContributorAccount()
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
    if (paymentIntervalDays === 0) setPaymentIntervalHours(3600)
  }, [paymentIntervalDays])

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Create a contributor account</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create a contributor account</DialogTitle>
          <DialogDescription className="flex flex-col gap-2">
            <p className="mt-2 text-justify">
              This will <b>create a contributor account smart contract</b> with
              a chosen time interval between payments.
            </p>
            <p className="text-justify">
              You will still be able to trigger payments manually and/or fund a
              Chainlink Automation with LINK that will trigger payments
              automatically.
            </p>
            <p>
              You can change this interval at any time, with a value{" "}
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
                Your account is being created...
              </span>
            ) : null}
            <Button
              type="submit"
              disabled={isCreatingAccount}
              onClick={() => createAccount()}
            >
              {isCreatingAccount ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Confirm
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
