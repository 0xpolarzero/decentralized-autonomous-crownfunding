"use client"

import React, { useEffect, useState } from "react"
import Link from "next/link"
import { calculate } from "@/helpers/calculate"
import useGlobalStore from "@/stores/useGlobalStore"
import { useQuery } from "@apollo/client"
import { waitForTransaction } from "@wagmi/core"
import { Loader2, LucideCompass, LucideSend, PauseCircle } from "lucide-react"
import { TransactionReceipt } from "viem"
import { useContractRead, useContractWrite } from "wagmi"

import { Contribution, ContributionToSend } from "@/types/contributions"
import { DACContributorAccountAbi } from "@/config/constants/abis/DACContributorAccount"
import {
  GET_CONTRIBUTOR_ACCOUNT,
  POLL_INTERVAL,
} from "@/config/constants/subgraph-queries"
import { networkConfig } from "@/config/network"
import { Button, buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/components/ui/use-toast"
import UpkeepComponent from "@/components/base-account-contributor/base"
import ClientOnly from "@/components/client-only"
import ContributorCreateAccount from "@/components/contributor-create-account"
import ContributorUpdatePaymentInterval from "@/components/contributor-update-payment-interval"
import { DataTable } from "@/components/data-table"
import {
  columns,
  columnsSkeleton,
} from "@/components/table-account-contributor/columns"
import formatData from "@/components/table-account-contributor/format-data"
import CurrencyComponent from "@/components/ui-extended/currency"
import { DataTableSkeleton } from "@/components/ui-extended/data-table-skeleton"
import DurationComponent from "@/components/ui-extended/duration"
import TooltipComponent from "@/components/ui-extended/tooltip"

export default function AccountContributorPage() {
  const {
    address,
    connected,
    currentNetwork,
    hasContributorAccount,
    contributorAccountAddress,
    walletLoading,
  } = useGlobalStore((state) => ({
    address: state.address,
    connected: state.connected,
    currentNetwork: state.currentNetwork,
    hasContributorAccount: state.hasContributorAccount,
    contributorAccountAddress: state.contributorAccountAddress,
    walletLoading: state.loading,
  }))
  const {
    data: contributorData,
    error,
    loading,
  } = useQuery(GET_CONTRIBUTOR_ACCOUNT, {
    variables: { address },
    pollInterval: POLL_INTERVAL,
  })

  const networkInfo =
    currentNetwork || networkConfig.networks[networkConfig.defaultNetwork]

  const { toast } = useToast()

  const [searchValue, setSearchValue] = useState<string>("")
  const [contributions, setContributions] = useState<Contribution[]>([])
  const [totalDistributed, setTotalDistributed] = useState<number>(0)
  const [totalStored, setTotalStored] = useState<number>(0)
  const [isProcessingTransaction, setIsProcessingTransaction] =
    useState<boolean>(false)

  const { data: paymentInterval }: any = useContractRead({
    address: contributorAccountAddress,
    abi: DACContributorAccountAbi,
    functionName: "getUpkeepInterval",
  })

  const { isLoading: isSendingContributions, write: sendContributions } =
    useContractWrite({
      address: contributorAccountAddress,
      abi: DACContributorAccountAbi,
      functionName: "triggerManualPayment",

      onSuccess: async (tx) => {
        setIsProcessingTransaction(true)

        const receipt: TransactionReceipt = await waitForTransaction({
          hash: tx.hash,
          confirmations: 5,
        })
        console.log(receipt)

        if (receipt.status === "success") {
          toast({
            title: "Contributions sent",
            description: (
              <>
                <p>
                  Your contributions were successfully sent to their respective
                  project.
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

  const handleSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value)

    if (!e.target.value || e.target.value.length < 1) {
      return
    }

    const filtered =
      contributorData.contributorAccounts[0].contributions.filter(
        (contribution: Contribution) =>
          contribution.project.name
            .toLowerCase()
            .includes(e.target.value.toLowerCase()) ||
          contribution.project.projectContract
            .toLowerCase()
            .includes(e.target.value.toLowerCase()) ||
          contribution.project.collaborators.some((c) =>
            c.toLowerCase().includes(e.target.value.toLowerCase())
          )
      )

    setContributions(filtered)
  }

  const clearSearch = () => {
    setSearchValue("")
    setContributions(contributorData.contributorAccounts[0].contributions)
  }

  useEffect(() => {
    if (
      contributorData &&
      contributorData.contributorAccounts &&
      hasContributorAccount
    ) {
      const contrib = contributorData.contributorAccounts?.length
        ? contributorData.contributorAccounts[0].contributions
        : []

      setContributions(contrib)
      setTotalDistributed(
        contrib.reduce(
          (acc: number, contribution: Contribution) =>
            acc + Number(contribution.amountDistributed),
          0
        )
      )
      setTotalStored(
        contrib.reduce(
          (acc: number, contribution: Contribution) =>
            acc + Number(contribution.amountStored),
          0
        )
      )
    }
  }, [contributorData, address, hasContributorAccount])

  return (
    <section className="container grid items-center gap-6 pb-8 pt-6 md:py-10">
      <ClientOnly>
        {!loading && (!connected || !address) ? (
          "You need to connect your wallet to see your contributions."
        ) : !loading && !contributorData?.contributorAccounts.length ? (
          <>
            <h1 className="text-3xl font-extrabold leading-tight tracking-tighter md:text-4xl">
              You don&apos;t have a contributor account yet.
            </h1>
            <p className="max-w-[800px] text-lg text-muted-foreground">
              Create one to be able to support projects.
            </p>
            <p className="max-w-[800px] text-sm text-muted-foreground">
              This account will store everything about your contributions in a
              smart contract.
            </p>
            <p className="max-w-[800px] text-sm text-muted-foreground">
              It will allow you to{" "}
              <b>create contributions for projects, update, and delete them</b>.
              The amount you dedicate to a contribution will be{" "}
              <b>stored inside the contract</b>, and <b>gradually released</b>{" "}
              to the project over the period you set.
            </p>
            <p className="max-w-[800px] text-sm text-muted-foreground">
              You will be able to setup <b>automated payments</b> to the
              projects at a frequency of your choice, using <b>Chainlink</b> to
              calculate the appropriate amounts to send, and transfer them to
              the projects.
            </p>
            <ContributorCreateAccount />
          </>
        ) : (
          <>
            <UpkeepComponent />
            <Separator />
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-col gap-1">
                <span className="text-muted-foreground">Contributed</span>
                {loading || walletLoading ? (
                  <Skeleton className="h-6 w-20" />
                ) : (
                  <CurrencyComponent
                    amount={totalDistributed}
                    currency="native"
                  />
                )}
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-muted-foreground">Stored</span>
                {loading || walletLoading ? (
                  <Skeleton className="h-6 w-20" />
                ) : (
                  <CurrencyComponent
                    amount={totalStored - totalDistributed}
                    currency="native"
                  />
                )}
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-muted-foreground">Total</span>
                {loading || walletLoading ? (
                  <Skeleton className="h-6 w-20" />
                ) : (
                  <CurrencyComponent amount={totalStored} currency="native" />
                )}
              </div>
              <div className="flex flex-col gap-1">
                Next payment expected
                {loading || walletLoading ? (
                  <Skeleton className="h-6 w-20" />
                ) : Number(
                    contributorData?.contributorAccounts[0]
                      .lastContributionsTransferedAt
                  ) +
                    Number(paymentInterval) <
                  new Date().getTime() / 1000 ? (
                  // The last payment was missed
                  <TooltipComponent
                    shownContent={
                      <span
                        className="flex items-center gap-2 text-sm text-muted-foreground"
                        style={{ color: "var(--yellow)" }}
                      >
                        <PauseCircle size={16} /> N/A
                      </span>
                    }
                    tooltipContent="Please make sure your Chainlink Automation is registered & funded."
                  />
                ) : paymentInterval &&
                  contributorData?.contributorAccounts?.length ? (
                  <div className="flex items-center gap-2">
                    <CurrencyComponent
                      amount={calculate
                        .totalContributions(
                          contributions,
                          Number(paymentInterval),
                          Number(
                            contributorData?.contributorAccounts[0]
                              .lastContributionsTransferedAt
                          ) + Number(paymentInterval)
                        )
                        .reduce(
                          (acc: number, contribution: ContributionToSend) =>
                            acc + contribution.amount,
                          0
                        )}
                      currency="native"
                    />{" "}
                    <TooltipComponent
                      shownContent={
                        <span className="flex items-center text-muted-foreground">
                          in{" "}
                          <DurationComponent
                            startTimestamp={new Date().getTime()}
                            endTimestamp={
                              (Number(
                                contributorData?.contributorAccounts[0]
                                  .lastContributionsTransferedAt
                              ) +
                                Number(paymentInterval)) *
                              1000
                            }
                          />
                        </span>
                      }
                      tooltipContent={new Date(
                        (Number(
                          contributorData?.contributorAccounts[0]
                            .lastContributionsTransferedAt
                        ) +
                          Number(paymentInterval)) *
                          1000
                      ).toLocaleString()}
                    />
                  </div>
                ) : (
                  <span className="text-sm text-muted-foreground">N/A</span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="default"
                className="grow"
                disabled={isSendingContributions}
                onClick={() => sendContributions()}
              >
                {isProcessingTransaction ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <LucideSend className="mr-2 h-4 w-4" />
                )}{" "}
                Send contributions (
                <CurrencyComponent
                  amount={calculate
                    .totalContributions(
                      contributions,
                      Number(paymentInterval),
                      new Date().getTime() / 1000
                    )
                    .reduce(
                      (acc: number, contribution: ContributionToSend) =>
                        acc + contribution.amount,
                      0
                    )}
                  currency="native"
                />
                )
              </Button>
              <ContributorUpdatePaymentInterval />
            </div>
            {isProcessingTransaction ? (
              <span className="text-sm text-muted-foreground">
                Your contributions are being sent to their respective project...
              </span>
            ) : null}
            <Link
              className="justify-self-center text-sm text-muted-foreground underline"
              href={`${currentNetwork?.blockExplorer.url}address/${contributorAccountAddress}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              See contributor account contract on block explorer
            </Link>
            <Separator />
            <div className="flex max-w-[1400px] flex-col items-start gap-2">
              <div className="my-4 flex w-full items-center space-x-2">
                <Input
                  type="search"
                  value={searchValue}
                  onChange={handleSearch}
                  placeholder="Search a contribution by project name, address or collaborator"
                />
                <button
                  className={buttonVariants({
                    variant: "outline",
                  })}
                  onClick={clearSearch}
                >
                  Clear
                </button>
              </div>
              <div className="flex w-[100%] items-center justify-between gap-2">
                <h1 className="text-3xl font-extrabold leading-tight tracking-tighter md:text-4xl">
                  Your contributions
                </h1>
                <Link className={buttonVariants()} href="/explore">
                  <LucideCompass size={16} className="mr-2" />
                  <span>Explore projects</span>
                </Link>
              </div>
              <p className="max-w-[700px] text-lg text-muted-foreground">
                Manage your contributions.
              </p>
            </div>
            <div className="grow overflow-auto">
              {loading || walletLoading ? (
                <DataTableSkeleton columns={columnsSkeleton} rowCount={10} />
              ) : error ? (
                "There was an error fetching the projects. Please try again later."
              ) : contributions.length ? (
                <DataTable
                  columns={columns}
                  // @ts-ignore
                  data={formatData(
                    contributions,
                    totalDistributed,
                    totalStored,
                    paymentInterval
                  )}
                />
              ) : (
                "You don't have any contributions yet."
              )}
            </div>
          </>
        )}
      </ClientOnly>
    </section>
  )
}
