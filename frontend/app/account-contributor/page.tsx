"use client"

import React, { useEffect, useState } from "react"
import Link from "next/link"
import useGlobalStore from "@/stores/useGlobalStore"
import { useQuery } from "@apollo/client"
import { LucidePlus } from "lucide-react"

import { Contribution } from "@/types/contributions"
import { ContributorAccount } from "@/types/contributor-account"
import { Project, ProjectTable } from "@/types/projects"
import {
  GET_CONTRIBUTOR_ACCOUNT,
  GET_PROJECTS,
} from "@/config/constants/subgraphQueries"
import { networkConfig } from "@/config/network"
import { Button, buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import ContributorCreateAccount from "@/components/contributor-create-account"
import ContributorUpkeepComponent from "@/components/contributor-upkeep"
import { DataTable } from "@/components/data-table"
import {
  columns,
  columnsSkeleton,
} from "@/components/table-account-projects/columns"
import formatData from "@/components/table-account-projects/format-data"
import { DataTableSkeleton } from "@/components/ui-extended/data-table-skeleton"

export default function AccountContributorPage() {
  const {
    address,
    connected,
    currentNetwork,
    hasContributorAccount,
    contributorAccountAddress,
  } = useGlobalStore((state) => ({
    address: state.address,
    connected: state.connected,
    currentNetwork: state.currentNetwork,
    hasContributorAccount: state.hasContributorAccount,
    contributorAccountAddress: state.contributorAccountAddress,
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
      setContributions(
        contributorData.contributorAccounts
          ? contributorData.contributorAccounts[0].contributions
          : []
      )
    }
  }, [contributorData, address, hasContributorAccount])

  if (!connected || !address)
    return (
      <section className="container grid items-center gap-6 pb-8 pt-6 md:py-10">
        You need to connect your wallet to see your contributions.
      </section>
    )

  if (!hasContributorAccount)
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

  // TODO IF NO CONTRIBUTIONS, STILL SHOW THE CHAINLINK COMPONENTS

  return (
    <section className="container grid items-center gap-6 pb-8 pt-6 md:py-10">
      <ContributorUpkeepComponent />
      <Separator />
      {contributions.length > 0 ? (
        <>
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
              <Link className={buttonVariants()} href="/submit-project">
                <LucidePlus size={16} className="mr-2" />
                <span>Submit a project</span>
              </Link>
            </div>
            <p className="max-w-[700px] text-lg text-muted-foreground">
              Interact with the projects you're involved in.
            </p>
          </div>
          <div className="grow overflow-auto">
            {loading ? (
              <DataTableSkeleton columns={columnsSkeleton} rowCount={10} />
            ) : error ? (
              "There was an error fetching the projects. Please try again later."
            ) : // <DataTable columns={columns} data={formatData(projects)} />
            null}
          </div>
        </>
      ) : (
        "You have no contributions yet."
      )}
    </section>
  )
}
