import React, { useEffect, useState } from "react"
import Image from "next/image"
import useGlobalStore from "@/stores/useGlobalStore"
import { Row } from "@tanstack/react-table"
import { waitForTransaction, writeContract } from "@wagmi/core"
import { Loader2 } from "lucide-react"
import { etherUnits, parseUnits } from "viem"

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
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const createContribution = async () => {
    if (!endDate) return

    setIsLoading(true)

    console.log(
      contributorAccountAddress,
      data.original.projectContract,
      parseUnits(`${Number(amount)}`, networkInfo.currency.decimals),
      endDate.getTime() / 1000
    )

    try {
      // Write to contract
      const { hash } = await writeContract({
        address: contributorAccountAddress,
        abi: [
          {
            type: "function",
            name: "createContribution",
            constant: false,
            stateMutability: "payable",
            payable: true,
            inputs: [
              {
                type: "address",
                name: "_projectContract",
              },
              {
                type: "uint256",
                name: "_amount",
              },
              {
                type: "uint256",
                name: "_endDate",
              },
            ],
            outputs: [],
          },
        ],
        functionName: "createContribution",
        args: [
          data.original.projectContract,
          parseUnits(`${Number(amount)}`, networkInfo.currency.decimals),
          endDate.getTime() / 1000,
        ],
        value: parseUnits(`${Number(amount)}`, networkInfo.currency.decimals),
      })
      // Wait for completion
      const receipt = await waitForTransaction({
        hash,
        timeout: networkInfo.timeout,
      })

      if (receipt.status === "success") {
        toast({
          title: "Contribution created",
          description: "Your contribution was successfully created.",
          action: (
            <ToastAction
              altText="See on explorer"
              onClick={() =>
                window.open(
                  `${networkInfo.blockExplorer.url}/tx/${receipt.transactionHash}`
                )
              }
            />
          ),
        })
      } else {
        toast({
          variant: "destructive",
          title: "Contribution creation failed",
          description: "Please try again.",
        })
      }
    } catch (err) {
      console.error(err)
      toast({
        variant: "destructive",
        title: "Something went wrong",
        description: "Please try again.",
      })
    }

    setIsLoading(false)
  }

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAmount(e.target.value)
  }

  useEffect(() => {
    console.log(amount)
    if (isNaN(Number(amount)) || Number(amount) <= 0 || !endDate) {
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
        <TooltipWithConditionComponent
          shownContent={
            <Button
              type="submit"
              disabled={!isFormValid || isLoading}
              onClick={createContribution}
            >
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Confirm
            </Button>
          }
          tooltipContent="Please fill in all fields"
          condition={!isFormValid}
        />
      </DialogFooter>
    </DialogContent>
  )
}

export default ContributeDialogComponent
