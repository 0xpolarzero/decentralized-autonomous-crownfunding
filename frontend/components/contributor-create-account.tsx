import { useState } from "react"
import Link from "next/link"
import useGlobalStore from "@/stores/useGlobalStore"
import { Separator } from "@radix-ui/react-dropdown-menu"
import { waitForTransaction } from "@wagmi/core"
import { Loader2 } from "lucide-react"
import { useContractWrite } from "wagmi"

import { DACAggregatorAbi } from "@/config/constants/abis/DACAggregator"
import { networkConfig, networkMapping } from "@/config/network"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"

import InfoComponent from "./ui-extended/info"
import TooltipWithConditionComponent from "./ui-extended/tooltip-with-condition"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog"
import { Label } from "./ui/label"
import { Slider } from "./ui/slider"

export default function ContributorCreateAccount() {
  const currentNetwork = useGlobalStore((state) => state.currentNetwork)

  const { toast } = useToast()

  const networkInfo =
    currentNetwork || networkConfig.networks[networkConfig.defaultNetwork]

  const [isCreatingAccount, setIsCreatingAccount] = useState<boolean>(false)
  const [paymentInterval, setPaymentInterval] = useState<number>(604800) // 7 days
  const [isIntervalValid, setIsIntervalValid] = useState<boolean>(true)

  const { write: createAccount } = useContractWrite({
    address: networkMapping[networkInfo.chainId]["DACAggregator"][0],
    abi: DACAggregatorAbi,
    functionName: "createContributorAccount",
    args: [paymentInterval],

    onSuccess: async (tx) => {
      setIsCreatingAccount(true)

      const receipt = await waitForTransaction({
        hash: tx.hash,
        confirmations: 5,
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
      } else {
        toast({
          variant: "destructive",
          title: "Something went wrong",
          description: "Please try again.",
        })
      }

      setIsCreatingAccount(false)
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

  const handlePaymentIntervalChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const interval = Number(e.target.value)
    setPaymentInterval(interval)
    setIsIntervalValid(interval >= 86400 && interval <= 2592000)
  }

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
              You can change this interval at any time, with a value between 1
              and 30 days.
            </p>
            <Separator className="my-2" />
            <span className="flex items-center gap-2 mb-2">
              Payment interval
              <InfoComponent content="The interval between automatic payments." />
            </span>
            {/* <Input
            type="number"
            placeholder="0.0"
            className="mb-2"
            value={paymentInterval}
            onChange={handlePaymentIntervalChange}
          /> */}
            <Slider
              value={[paymentInterval]}
              min={86400}
              max={2592000}
              step={86400}
              onValueChange={([value]) => setPaymentInterval(value)}
            />
            <Label className="justify-self-start">
              {paymentInterval / 86400}{" "}
              {paymentInterval / 86400 > 1 ? "days" : "day"}
            </Label>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <div
            className={`flex grow items-center ${
              isCreatingAccount ? "justify-between" : "justify-end"
            }`}
          >
            {isCreatingAccount ? (
              <span className="justify-self-start text-sm text-gray-400">
                Your account is being created...
              </span>
            ) : null}
            <TooltipWithConditionComponent
              shownContent={
                <Button
                  type="submit"
                  disabled={isCreatingAccount || !isIntervalValid}
                  onClick={() => createAccount()}
                >
                  {isCreatingAccount ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
                  Confirm
                </Button>
              }
              tooltipContent="Please fill in all fields"
              condition={!isIntervalValid}
            />
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
