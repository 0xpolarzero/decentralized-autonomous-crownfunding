import React, { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import useGlobalStore from "@/stores/useGlobalStore"
import { Row } from "@tanstack/react-table"
import { waitForTransaction } from "@wagmi/core"
import { Loader2 } from "lucide-react"
import { parseUnits } from "viem"
import { useContractWrite } from "wagmi"

import { NetworkInfo } from "@/types/network"
import { DACContributorAccountAbi } from "@/config/constants/abis/DACContributorAccount"
import { abi, currencies, networkConfig } from "@/config/network"
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
import { ToastAction } from "@/components/ui/toast"
import { useToast } from "@/components/ui/use-toast"
import InfoComponent from "@/components/ui-custom/info"
import { ProjectTable } from "@/app/explore/projects-table/types"

import { DatePickerComponent } from "./ui-custom/date-picker"
import TooltipWithConditionComponent from "./ui-custom/tooltip-with-condition"

interface ContributeDialogComponentProps {
  data: Row<ProjectTable>
}

const ContributeDialogComponent: React.FC<ContributeDialogComponentProps> = ({
  data,
}) => {
  const { toast } = useToast()

  const { contributorAccountAddress, currentNetwork } = useGlobalStore(
    (state) => ({
      contributorAccountAddress: state.contributorAccountAddress,
      currentNetwork: state.currentNetwork,
    })
  )

  const networkInfo =
    currentNetwork || networkConfig.networks[networkConfig.defaultNetwork]

  const [amount, setAmount] = useState<number | string>(0)
  const [endDate, setEndDate] = useState<Date | undefined>(new Date())
  const [isFormValid, setIsFormValid] = useState<boolean>(false)
  const [isProcessingTransaction, setIsProcessingTransaction] =
    useState<boolean>(false)

  const { isLoading: isCreatingContribution, write: createContribution } =
    useContractWrite({
      address: contributorAccountAddress,
      abi: DACContributorAccountAbi,
      functionName: "createContribution",
      args: [
        data.original.projectContract,
        parseUnits(`${Number(amount)}`, networkInfo.currency.decimals),
        endDate ? endDate.getTime() / 1000 : 0,
      ],
      value: parseUnits(`${Number(amount)}`, networkInfo.currency.decimals),
      enabled: Number(amount) > 0 && typeof endDate !== "undefined",

      onSuccess: async (tx) => {
        setIsProcessingTransaction(true)

        const receipt = await waitForTransaction({
          hash: tx.hash,
          confirmations: 2,
        })
        console.log(receipt)

        if (receipt.status === "success") {
          toast({
            title: "Contribution created",
            description: (
              <>
                <p>Your contribution was successfully created.</p>
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

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAmount(e.target.value)
  }

  useEffect(() => {
    if (
      isNaN(Number(amount)) ||
      Number(amount) <= 0 ||
      !endDate ||
      endDate < new Date()
    ) {
      setIsFormValid(false)
    } else {
      setIsFormValid(true)
    }
  }, [amount, endDate])

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Contribute to {data.original.name}</DialogTitle>
        <DialogDescription className="flex flex-col gap-2">
          <p className="mt-2 text-justify">
            This will{" "}
            <b>
              store the desired amount securely in your contributor account
              contract
            </b>
            , and <b>distribute it</b> evenly to the project&apos;s contributors
            over the specified period.
          </p>
          <p className="text-justify">
            You will be able to trigger payments manually and/or fund a
            Chainlink Automation with LINK that will trigger payments
            automatically.
          </p>
          <Separator className="my-2" />
          <span className="flex items-center gap-2">
            Amount{" "}
            <Image
              src={currencies.matic.icon}
              alt="matic"
              width={16}
              height={16}
            />
            <InfoComponent content="The amount you want to contribute to the project over the period." />
          </span>
          <Input
            type="number"
            placeholder="0.0"
            className="mb-2"
            value={amount}
            onChange={handleAmountChange}
          />
          <span className="flex items-center gap-2">
            End date
            <InfoComponent content="The date at which the entire contribution should be sent." />
          </span>
          <DatePickerComponent date={endDate} setDate={setEndDate} />
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
              Your contribution is being submitted...
            </span>
          ) : null}
          <TooltipWithConditionComponent
            shownContent={
              <Button
                type="submit"
                disabled={!isFormValid || isCreatingContribution}
                onClick={() => createContribution()}
              >
                {isCreatingContribution ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Confirm
              </Button>
            }
            tooltipContent="Please fill in all fields"
            condition={!isFormValid}
          />
        </div>
      </DialogFooter>
    </DialogContent>
  )
}

export default ContributeDialogComponent
