import { useEffect, useState } from "react"
import Link from "next/link"
import useGlobalStore from "@/stores/useGlobalStore"
import { waitForTransaction, writeContract } from "@wagmi/core"
import { Loader2 } from "lucide-react"
import { formatUnits, parseUnits } from "viem"
import { useContractRead } from "wagmi"

import { DACContributorAccountAbi } from "@/config/constants/abis/DACContributorAccount"
import { LinkTokenAbi } from "@/config/constants/abis/LinkToken"
import { networkConfig } from "@/config/network"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import InfoComponent from "@/components/ui-extended/info"

const formatAmount = (value: number) =>
  Number(Number(formatUnits(BigInt(value), 18)).toFixed(4))
const parseAmount = (value: number | string) =>
  parseUnits(`${Number(value)}`, 18)

interface UpkeepCreateComponentProps {
  refetchUpkeepId: () => void
  refetchUpkeepInfo: () => void
}

const UpkeepCreateComponent: React.FC<UpkeepCreateComponentProps> = ({
  refetchUpkeepId,
  refetchUpkeepInfo,
}) => {
  const { contributorAccountAddress, currentNetwork } = useGlobalStore(
    (state) => ({
      contributorAccountAddress: state.contributorAccountAddress,
      currentNetwork: state.currentNetwork,
    })
  )

  const networkInfo =
    currentNetwork || networkConfig.networks[networkConfig.defaultNetwork]

  const { toast } = useToast()

  const [isFundingComplete, setIsFundingComplete] = useState<boolean>(false)
  const [isProcessingRegistration, setIsProcessingRegistration] =
    useState<boolean>(false)
  const [processingMessage, setProcessingMessage] = useState<string>("")
  const linkAmountRequired = parseUnits(`${1}`, 18) // Amount of LINK required to fund the contract
  const [inputValue, setInputValue] = useState<number | string>(
    Number(formatAmount(Number(linkAmountRequired)))
  )
  const [linkAmountRegistration, setLinkAmountRegistration] = useState<number>(
    Number(formatAmount(Number(linkAmountRequired)))
  )
  const [isLinkAmountValid, setIsLinkAmountValid] = useState<boolean>(false)

  // Read contract to check if it already has enough LINK
  const { data: linkBalance, refetch: refetchLinkBalance }: any =
    useContractRead({
      address: networkInfo.contracts.LINK as `0x${string}`,
      abi: LinkTokenAbi,
      functionName: "balanceOf",
      args: [contributorAccountAddress],
    })

  const createUpkeep = async () => {
    try {
      setIsProcessingRegistration(true)

      if (!isFundingComplete) {
        setProcessingMessage("Funding contract with LINK...")

        // Step 1: Send LINK to the contract
        const { hash: hashFunding } = await writeContract({
          address: networkInfo.contracts.LINK as `0x${string}`,
          abi: LinkTokenAbi,
          functionName: "transfer",
          args: [contributorAccountAddress, BigInt(linkAmountRegistration)],
        })

        const receiptFunding = await waitForTransaction({
          hash: hashFunding,
          confirmations: 5,
        })

        if (receiptFunding.status === "success") {
          setIsFundingComplete(true)

          toast({
            title: "Contract funded",
            description: (
              <>
                <p>Your contract has been funded with LINK.</p>
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
      }

      // Step 2: Register the upkeep
      const { data: newLinkBalance } = await refetchLinkBalance()

      setProcessingMessage("Registering Chainlink Upkeep...")
      const { hash: hashRegistration } = await writeContract({
        address: contributorAccountAddress,
        abi: DACContributorAccountAbi,
        functionName: "registerNewUpkeep",
        args: [newLinkBalance],
      })

      const receiptRegistration = await waitForTransaction({
        hash: hashRegistration,
        confirmations: 5,
      })

      if (receiptRegistration.status === "success") {
        toast({
          title: "Upkeep registered",
          description: (
            <>
              <p>Your Upkeep has been successfully registered.</p>
              <p>
                <Link
                  href={`${networkInfo.blockExplorer.url}tx/${hashRegistration}`}
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

        refetchUpkeepId()
        refetchUpkeepInfo()
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

    setIsProcessingRegistration(false)
    setProcessingMessage("")
  }

  useEffect(() => {
    if (linkBalance && linkBalance >= linkAmountRequired) {
      setIsFundingComplete(true)
    }
  }, [linkBalance, linkAmountRequired])

  useEffect(() => {
    if (
      isNaN(Number(inputValue)) ||
      parseAmount(Number(inputValue)) < linkAmountRequired
    ) {
      setIsLinkAmountValid(false)
    } else {
      setIsLinkAmountValid(true)
      setLinkAmountRegistration(Number(parseAmount(Number(inputValue))))
    }
  }, [inputValue, linkAmountRequired])

  useEffect(() => () => setIsFundingComplete(false), [])

  return (
    <div className="flex flex-col gap-2">
      <Label className="flex items-center gap-2 text-muted-foreground">
        Amount of LINK to register Upkeep{" "}
        <InfoComponent
          content={
            <>
              <p>
                This will register a Chainlink Upkeep and fund it with LINK.
              </p>
              <p>
                It will be used to trigger contributions payments automatically
                at specified periods.
              </p>
            </>
          }
        />
      </Label>
      <div className="flex flex-wrap items-center gap-2">
        <div>
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Enter the amount"
            min={Number(parseAmount(Number(linkAmountRequired)))}
            className="min-w-[300px]"
          />
        </div>
        <Button
          onClick={createUpkeep}
          disabled={!isLinkAmountValid || isProcessingRegistration}
          className="grow"
        >
          {isProcessingRegistration ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : null}
          Register Chainlink Upkeep
        </Button>
      </div>
      {isProcessingRegistration && processingMessage ? (
        <div className="mt-1 text-muted-foreground">{processingMessage}</div>
      ) : null}
      {!isLinkAmountValid ? (
        <div
          className="mt-1 text-sm text-muted-foreground"
          style={{ color: "var(--yellow)" }}
        >
          Please enter a valid amount. It should be higher than{" "}
          {formatAmount(Number(linkAmountRequired))} LINK.
        </div>
      ) : null}
    </div>
  )
}

export default UpkeepCreateComponent
