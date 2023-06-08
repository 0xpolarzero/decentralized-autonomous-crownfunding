import React, { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import useGlobalStore from "@/stores/useGlobalStore"
import { waitForTransaction } from "@wagmi/core"
import { Loader2, LucideEdit } from "lucide-react"
import { GetTransactionReceiptParameters, formatUnits, parseUnits } from "viem"
import { useContractWrite } from "wagmi"

import { DACContributorAccountAbi } from "@/config/constants/abis/DACContributorAccount"
import { currencies, networkConfig } from "@/config/network"
import { Button } from "@/components/ui/button"
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/components/ui/use-toast"
import InfoComponent from "@/components/ui-extended/info"
import TooltipWithConditionComponent from "@/components/ui-extended/tooltip-with-condition"

interface ButtonEditContributionComponentProps {
  amounts: { stored: number; distributed: number }
  contributionIndex: number
  projectLastActivityAt: number
}

const ButtonEditContributionComponent: React.FC<
  ButtonEditContributionComponentProps
> = ({ amounts, contributionIndex, projectLastActivityAt }) => {
  const { currentNetwork, contributorAccountAddress } = useGlobalStore(
    (state) => ({
      currentNetwork: state.currentNetwork,
      contributorAccountAddress: state.contributorAccountAddress,
    })
  )

  const networkInfo =
    currentNetwork || networkConfig.networks[networkConfig.defaultNetwork]

  const formatAmount = (value: number) =>
    Number(
      Number(formatUnits(BigInt(value), networkInfo.currency.decimals)).toFixed(
        4
      )
    )
  const parseAmount = (value: number | string) =>
    parseUnits(`${Number(value)}`, networkInfo.currency.decimals)

  const isProjectStillActive = (): boolean =>
    new Date().getTime() - new Date(projectLastActivityAt).getTime() <
    1000 * 60 * 60 * 24 * 30 // 30 days

  const [amount, setAmount] = useState<number | string>(
    formatAmount(amounts.stored)
  )
  const [isValidAmount, setIsValidAmount] = useState<boolean>(true)
  const [isContributionIncrease, setIsContributionIncrease] =
    useState<boolean>(false)
  const [isProcessingTransaction, setIsProcessingTransaction] =
    useState<boolean>(false)

  const { toast } = useToast()

  const onSuccess = async (
    tx: GetTransactionReceiptParameters,
    toastTitle: string,
    toastDescription: string
  ) => {
    setIsProcessingTransaction(true)

    const receipt = await waitForTransaction({
      hash: tx.hash,
      confirmations: 5,
    })
    console.log(receipt)

    if (receipt.status === "success") {
      toast({
        title: toastTitle,
        description: (
          <>
            <p>{toastDescription}</p>
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
  }

  const { isLoading: isUpdating, write: updateContribution } = useContractWrite(
    {
      address: contributorAccountAddress,
      abi: DACContributorAccountAbi,
      functionName: "updateContribution",
      args: [contributionIndex, parseAmount(amount)],
      value: isContributionIncrease
        ? parseAmount(amount) - BigInt(amounts.stored)
        : 0,

      onSuccess: (tx) =>
        onSuccess(
          tx,
          "Contribution updated",
          "Your contribution was successfully updated."
        ),
      onError: (err) => {
        toast({
          variant: "destructive",
          title: "Something went wrong",
          description: "Please try again.",
        })
        console.error(err)
      },
    }
  )

  const { isLoading: isCanceling, write: cancelContribution } =
    useContractWrite({
      address: contributorAccountAddress,
      abi: DACContributorAccountAbi,
      functionName: "updateContribution",
      args: [contributionIndex, amounts.distributed],

      onSuccess: (tx) =>
        onSuccess(
          tx,
          "Contribution deleted",
          "Your contribution was successfully deleted."
        ),
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
    if (isNaN(Number(amount)) || parseAmount(amount) <= amounts.distributed) {
      setIsValidAmount(false)
    } else {
      setIsValidAmount(true)
    }

    if (!isNaN(Number(amount)) && parseAmount(amount) > amounts.stored) {
      setIsContributionIncrease(true)
    } else {
      setIsContributionIncrease(false)
    }
  }, [amount])

  return (
    <>
      <DialogTrigger asChild>
        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
          <LucideEdit size={16} className="mr-2" color="var(--green)" />
          <span style={{ color: "var(--green)" }}>Edit contribution</span>
        </DropdownMenuItem>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update contribution</DialogTitle>
          <DialogDescription className="flex flex-col gap-2">
            <p className="mt-2 text-justify">
              This will{" "}
              <b>
                update the amount stored in your contract dedicated to this
                project.
              </b>
            </p>
            <p className="text-justify">
              If you choose a higher amount than the one currently stored, it
              will ask you to add some funds to cover the difference. If the
              amount is lower however, it will withdraw the difference to your
              wallet.
            </p>
            <p className="text-justify">
              <b>
                You can&apos;t choose an amount lower than the amount already
                distributed to the project.
              </b>
            </p>
            <p className="text-justify">
              If you cancel your contribution, the amount intended for
              distribution will be sent back to your wallet.
            </p>
            <Separator className="my-2" />
            <span className="flex items-center gap-2">
              New contribution{" "}
              <Image
                src={currencies.matic.icon}
                alt="matic"
                width={16}
                height={16}
              />
              <InfoComponent content="The new amount you want to contribute to the project over the same period." />
            </span>
            <Input
              type="number"
              placeholder="0.0"
              className="mb-2"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min={formatAmount(amounts.distributed)}
            />
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <div className="flex flex-col gap-2 items-start w-full">
            {isProcessingTransaction ? (
              <span className="text-sm text-gray-400 mb-2">
                Your contribution is being updated...
              </span>
            ) : null}
            <div className="flex grow items-center justify-between w-full ">
              <Button
                variant="secondary"
                style={{ background: "var(--red)", color: "white" }}
                disabled={isUpdating || isCanceling}
                onClick={() => cancelContribution()}
              >
                {isCanceling ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Cancel contribution
              </Button>
              <TooltipWithConditionComponent
                shownContent={
                  <Button
                    type="submit"
                    disabled={
                      !isValidAmount ||
                      !isProjectStillActive() ||
                      isUpdating ||
                      isCanceling
                    }
                    onClick={() => updateContribution()}
                  >
                    {isUpdating ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : null}
                    Confirm
                  </Button>
                }
                tooltipContent={
                  !isProjectStillActive()
                    ? "This project is no longer active. You can cancel your contribution to retrieve the remaining contribution."
                    : "Please enter an amount higher than the amount already distributed to the project."
                }
                condition={!isValidAmount || !isProjectStillActive()}
              />
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </>
  )
}

export default ButtonEditContributionComponent
