"use client"

import React, { useEffect, useState } from "react"
import Link from "next/link"
import { calculate } from "@/helpers/calculate"
import useGlobalStore from "@/stores/useGlobalStore"
import { useQuery } from "@apollo/client"
import { LucideCompass, PauseCircle } from "lucide-react"
import { useContractRead } from "wagmi"

import { Contribution, ContributionToSend } from "@/types/contributions"
import { ContributorAccount } from "@/types/contributor-account"
import { DACContributorAccountAbi } from "@/config/constants/abis/DACContributorAccount"
import { GET_CONTRIBUTOR_ACCOUNT } from "@/config/constants/subgraph-queries"
import { networkConfig } from "@/config/network"
import { buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import UpkeepComponent from "@/components/base-account-contributor/base"
import ContributorCreateAccount from "@/components/contributor-create-account"
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
  })

  const networkInfo =
    currentNetwork || networkConfig.networks[networkConfig.defaultNetwork]
  const additionalData = {
    network: networkInfo.name,
    blockExplorer: `${networkInfo.blockExplorer.url}/address/${contributorAccountAddress}`,
    userAddress: address,
  }

  const [searchValue, setSearchValue] = useState<string>("")
  const [contributorAccount, setContributorAccount] =
    useState<ContributorAccount | null>(null)
  const [contributions, setContributions] = useState<Contribution[]>([])
  const [totalDistributed, setTotalDistributed] = useState<number>(0)
  const [totalStored, setTotalStored] = useState<number>(0)

  const { data: paymentInterval }: any = useContractRead({
    address: contributorAccountAddress,
    abi: DACContributorAccountAbi,
    functionName: "getUpkeepInterval",
  })

  const handleSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value)

    if (!e.target.value || e.target.value.length < 1) {
      setContributorAccount(
        contributorData.contributorAccounts[0].contributions
      )
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
      setContributorAccount(contributorData.contributorAccounts[0])

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

  if (!loading && (!connected || !address))
    return (
      <section className="container grid items-center gap-6 pb-8 pt-6 md:py-10">
        You need to connect your wallet to see your contributions.
      </section>
    )

  if (!loading && !contributorData?.contributorAccounts.length)
    return (
      <section className="container grid items-center gap-6 pb-8 pt-6 md:py-10">
        <h1 className="text-3xl font-extrabold leading-tight tracking-tighter md:text-4xl">
          You don't have a contributor account yet.
        </h1>
        <p className="max-w-[800px] text-lg text-muted-foreground">
          Create one to be able to support projects.
        </p>
        <p className="max-w-[800px] text-sm text-muted-foreground">
          This account will store everything about your contributions in a smart
          contract.
        </p>
        <p className="max-w-[800px] text-sm text-muted-foreground">
          It will allow you to{" "}
          <b>create contributions for projects, update, and delete them</b>. The
          amount you dedicate to a contribution will be{" "}
          <b>stored inside the contract</b>, and <b>gradually released</b> to
          the project over the period you set.
        </p>
        <p className="max-w-[800px] text-sm text-muted-foreground">
          You will be able to setup <b>automated payments</b> to the projects at
          a frequency of your choice, using <b>Chainlink</b> to calculate the
          appropriate amounts to send, and transfer them to the projects.
        </p>
        <ContributorCreateAccount />
      </section>
    )

  return (
    <section className="container grid items-center gap-6 pb-8 pt-6 md:py-10">
      <UpkeepComponent />
      <Separator />
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex flex-col gap-1">
          Total contributed
          {loading || walletLoading ? (
            <Skeleton className="h-6 w-20" />
          ) : (
            <CurrencyComponent amount={totalDistributed} currency="native" />
          )}
        </div>
        <div className="flex flex-col gap-1">
          Total stored
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
                  className="flex items-center gap-2 text-muted-foreground text-sm"
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
            <span className="text-muted-foreground text-sm">N/A</span>
          )}
        </div>
      </div>
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
    </section>
  )
}
