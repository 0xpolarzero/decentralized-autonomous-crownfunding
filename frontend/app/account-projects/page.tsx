"use client"

import React, { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import useGlobalStore from "@/stores/useGlobalStore"
import { useQuery } from "@apollo/client"
import { LucidePlus } from "lucide-react"

import { Project, ProjectTable } from "@/types/projects"
import {
  GET_PROJECTS,
  POLL_INTERVAL,
} from "@/config/constants/subgraph-queries"
import { networkConfig } from "@/config/network"
import { buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import ClientOnly from "@/components/client-only"
import { DataTable } from "@/components/data-table"
import {
  columns,
  columnsSkeleton,
} from "@/components/table-account-projects/columns"
import formatData from "@/components/table-account-projects/format-data"
import { DataTableSkeleton } from "@/components/ui-extended/data-table-skeleton"

export default function AccountProjectsPage() {
  const {
    data: initialData,
    error,
    loading,
  } = useQuery(GET_PROJECTS, {
    variables: { amountPerPage: 1000, skip: 0 },
    pollInterval: POLL_INTERVAL,
  })

  const { address, connected, currentNetwork } = useGlobalStore((state) => ({
    address: state.address,
    connected: state.connected,
    currentNetwork: state.currentNetwork,
  }))

  const [projects, setProjects] = useState<Project[]>([])
  const [searchValue, setSearchValue] = useState<string>("")

  const handleSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value)
    // We cannot perform 'OR' searches, or search an array of strings with The Graph
    // so right now we're better off querying a large amount of projects and
    // filtering them on the client side
    const projectsAppended = withNetworkAppened(initialData?.projects)

    if (!e.target.value || e.target.value.length < 1) {
      setProjects(projectsAppended)
      return
    }

    const filtered = projectsAppended.filter(
      (project: Project) =>
        project.name.toLowerCase().includes(e.target.value.toLowerCase()) ||
        project.projectContract
          .toLowerCase()
          .includes(e.target.value.toLowerCase()) ||
        project.collaborators.some((c) =>
          c.toLowerCase().includes(e.target.value.toLowerCase())
        )
    )

    setProjects(filtered)
  }

  const clearSearch = () => {
    setSearchValue("")
    setProjects(withNetworkAppened(initialData?.projects))
  }

  // or wrap it in a useCallback
  const withNetworkAppened = useCallback(
    (data: Project[]) => {
      const networkInfo =
        currentNetwork || networkConfig.networks[networkConfig.defaultNetwork]

      return data.map((project) => ({
        ...project,
        network: networkInfo.name,
        blockExplorer: `${networkInfo.blockExplorer.url}/address/${project.projectContract}`,
        userAddress: address,
      }))
    },
    [address, currentNetwork]
  )

  useEffect(() => {
    if (initialData && initialData.projects) {
      setProjects(
        withNetworkAppened(
          initialData.projects.filter((project: ProjectTable) =>
            project.collaborators.some(
              (c: string) => c.toLowerCase() === address.toLowerCase()
            )
          )
        )
      )
    }
  }, [initialData, address, withNetworkAppened])

  return (
    <section className="container grid items-center gap-6 pb-8 pt-6 md:py-10">
      <ClientOnly>
        {!connected || !address ? (
          " You need to connect your wallet to see your projects."
        ) : (
          <>
            <div className="flex max-w-[1400px] flex-col items-start gap-2">
              <div className="my-4 flex w-full items-center space-x-2">
                <Input
                  type="search"
                  value={searchValue}
                  onChange={handleSearch}
                  placeholder="Search a project by name, address or projects involving a collaborator"
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
                  Your projects
                </h1>
                <Link className={buttonVariants()} href="/submit-project">
                  <LucidePlus size={16} className="mr-2" />
                  <span>Submit a project</span>
                </Link>
              </div>
              <p className="max-w-[700px] text-lg text-muted-foreground">
                Interact with the projects you&apos;re involved in.
              </p>
            </div>
            <div className="grow overflow-auto">
              {loading ? (
                <DataTableSkeleton columns={columnsSkeleton} rowCount={10} />
              ) : error || !initialData ? (
                "There was an error fetching the projects. Please try again later."
              ) : (
                // @ts-ignore
                <DataTable columns={columns} data={formatData(projects)} />
              )}
            </div>
          </>
        )}
      </ClientOnly>
    </section>
  )
}
