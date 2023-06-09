import React, { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import useGlobalStore from "@/stores/useGlobalStore"
import { waitForTransaction, writeContract } from "@wagmi/core"
import { Loader2 } from "lucide-react"
import { formatUnits, parseUnits } from "viem"
import { useContractRead } from "wagmi"

import { KeeperRegistry2_0Abi } from "@/config/constants/abis/KeeperRegistry2_0"
import { LinkTokenAbi } from "@/config/constants/abis/LinkToken"
import { currencies, networkConfig } from "@/config/network"
import { Button } from "@/components/ui/button"
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/components/ui/use-toast"
import InfoComponent from "@/components/ui-extended/info"
import TooltipWithConditionComponent from "@/components/ui-extended/tooltip-with-condition"

interface UpkeepCancelDialogComponentProps {
  upkeepId: bigint
}

const UpkeepCancelDialogComponent: React.FC<
  UpkeepCancelDialogComponentProps
> = ({ upkeepId }) => {
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
  const [inputValue, setInputValue] = useState<number | string>(0)
  const [linkAmount, setLinkAmount] = useState<bigint>(BigInt(0))
  const [isInputValid, setIsInputValid] = useState<boolean>(false)

  const { data: allowance, refetch: refetchAllowance }: any = useContractRead({
    address: networkInfo.contracts.LINK as `0x${string}`,
    abi: LinkTokenAbi,
    functionName: "allowance",
    args: [address, networkInfo.contracts.KEEPER_REGISTRY as `0x${string}`],
  })

  const fundUpkeep = async () => {
    console.log(allowance, linkAmount)
    try {
      setIsProcessingTransaction(true)

      if (allowance < linkAmount) {
        setProcessingMessage("Allowing spending of LINK...")
        // Step 1: Allow spending of LINK
        const { hash: hashAllowance } = await writeContract({
          address: networkInfo.contracts.LINK as `0x${string}`,
          abi: LinkTokenAbi,
          functionName: "approve",
          args: [
            networkInfo.contracts.KEEPER_REGISTRY as `0x${string}`,
            linkAmount,
          ],
        })

        const receiptAllowance = await waitForTransaction({
          hash: hashAllowance,
          confirmations: 5,
        })

        if (receiptAllowance.status === "success") {
          toast({
            title: "Allowed spending of LINK",
            description: (
              <>
                <p>
                  You successfully approved spending of{" "}
                  {formatUnits(allowance, 18)} LINK
                </p>
                <p>
                  <Link
                    href={`${networkInfo.blockExplorer.url}tx/${hashAllowance}`}
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
      }

      // Step 2: Add funds to Upkeep
      const { data: newAllowed } = await refetchAllowance()
      if (newAllowed < linkAmount) {
        // Just start again
        fundUpkeep()
        return
      }

      setProcessingMessage("Funding Upkeep...")
      const { hash: hashFunding } = await writeContract({
        address: networkInfo.contracts.KEEPER_REGISTRY as `0x${string}`,
        abi: KeeperRegistry2_0Abi,
        functionName: "addFunds",
        args: [upkeepId, linkAmount],
      })

      const receiptFunding = await waitForTransaction({
        hash: hashFunding,
        confirmations: 5,
      })

      if (receiptFunding.status === "success") {
        toast({
          title: "Upkeep funded",
          description: (
            <>
              <p className="flex items-center gap-2">
                Your Upkeep has been successfully funded with{" "}
                {Number(Number(formatUnits(linkAmount, 18)).toFixed(4))} LINK.
              </p>
              <p>
                <Link
                  href={`${networkInfo.blockExplorer.url}tx/${hashFunding}`}
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
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Something went wrong",
        description: "Please try again.",
      })
      console.error(error)
    }

    setIsProcessingTransaction(false)
    setProcessingMessage("")
  }

  useEffect(() => {
    if (isNaN(Number(inputValue)) || Number(inputValue) <= 0) {
      setIsInputValid(false)
    } else {
      setIsInputValid(true)
      setLinkAmount(parseUnits(`${Number(inputValue)}`, 18))
    }
  }, [inputValue])

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Add funds to Upkeep</DialogTitle>
        <DialogDescription className="flex flex-col gap-2">
          <p className="mt-2 text-justify">
            This will fund your Upkeep with the specified amount of LINK.
          </p>
          <p className="text-justify">
            You will always be able to cancel the Upkeep and{" "}
            <b>withdraw the unused balance</b> at any time, here or on the
            Chainlink Automation UI.
          </p>
          <p className="text-justify">
            These funds will be used to pay for the Upkeep's transactions,
            meaning the contributions payments at the payment interval currently
            set up.
          </p>
          <Separator className="my-2" />
          <span className="flex items-center gap-2">
            Amount{" "}
            <Image
              src={currencies.link.icon}
              alt="link"
              width={16}
              height={16}
            />
            <InfoComponent content="The funding amount in LINK" />
          </span>
          <Input
            type="number"
            placeholder="0.0"
            className="mb-2"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            disabled={isProcessingTransaction}
          />
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
              {processingMessage || "Processing transaction..."}
            </span>
          ) : null}
          <TooltipWithConditionComponent
            shownContent={
              <Button
                type="submit"
                disabled={!isInputValid || isProcessingTransaction}
                onClick={() => fundUpkeep()}
              >
                {isProcessingTransaction ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Fund
              </Button>
            }
            tooltipContent="Please enter a valid amount"
            condition={!isInputValid}
          />
        </div>
      </DialogFooter>
    </DialogContent>
  )
}

export default UpkeepCancelDialogComponent
