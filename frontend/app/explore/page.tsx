"use client"

import React, { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import useGlobalStore from "@/stores/useGlobalStore"
import { useQuery } from "@apollo/client"
import { LucidePlus } from "lucide-react"

import { Project } from "@/types/projects"
import { GET_PROJECTS } from "@/config/constants/subgraph-queries"
import { networkConfig } from "@/config/network"
import { Button, buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import ClientOnly from "@/components/client-only"
import { DataTable } from "@/components/data-table"
import ComboboxComponent, {
  OptionProps,
} from "@/components/ui-extended/combobox"
import { DataTableSkeleton } from "@/components/ui-extended/data-table-skeleton"
import TooltipComponent from "@/components/ui-extended/tooltip"

import {
  columns,
  columnsSkeleton,
} from "../../components/table-projects/columns"
import formatData from "../../components/table-projects/format-data"

export default function ExplorePage() {
  const {
    data: initialData,
    error,
    loading,
  } = useQuery(GET_PROJECTS, {
    variables: { amountPerPage: 1000, skip: 0 },
  })
  const { currentNetwork, connected } = useGlobalStore((state) => ({
    currentNetwork: state.currentNetwork,
    connected: state.connected,
  }))

  const [projects, setProjects] = useState<Project[]>([])
  const [tags, setTags] = useState<OptionProps[]>([])
  const [searchValue, setSearchValue] = useState<string>("")

  const handleSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value)
    // We cannot perform 'OR' searches, or search an array of strings with The Graph
    // so right now we're better off querying a large amount of projects and
    // filtering them on the client side
    const projectsAppended = withNetworkAppened(initialData.projects)

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
    setProjects(withNetworkAppened(initialData.projects))
  }

  const handleTagChange = (value: string) => {
    if (!initialData || !initialData.projects) return

    const projectsAppended = withNetworkAppened(initialData.projects)

    if (!value || value === "") {
      setProjects(projectsAppended)
      return
    }

    const filtered = projectsAppended.filter((project: Project) =>
      project.tags.includes(value)
    )

    setProjects(filtered)
  }

  const withNetworkAppened = useCallback(
    (data: Project[]) => {
      const networkInfo =
        currentNetwork || networkConfig.networks[networkConfig.defaultNetwork]

      return data.map((project) => ({
        ...project,
        network: networkInfo.name,
        blockExplorer: `${networkInfo.blockExplorer.url}/address/${project.projectContract}`,
      }))
    },
    [currentNetwork]
  )

  const initProjects = useCallback(() => {
    setProjects(withNetworkAppened(initialData.projects))
    setTags(
      initialData.projects
        // Gather all tags from all projects
        .map((project: Project) => project.tags)
        .flat()
        // Remove duplicates
        .filter((tag: string, index: number, self: string[]) => {
          return self.indexOf(tag) === index
        })
        // Format it for the combobox
        .map((tag: string) => ({ value: tag, label: tag }))
    )
  }, [initialData, withNetworkAppened])

  useEffect(() => {
    if (initialData && initialData.projects) initProjects()
  }, [initialData, initProjects])

  return (
    <ClientOnly>
      <section className="container grid items-center gap-6 pb-8 pt-6 md:py-10">
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
              Latest projects
            </h1>
            {connected ? (
              <Link className={buttonVariants()} href="/submit-project">
                <LucidePlus size={16} className="mr-2" />
                <span>Submit a project</span>
              </Link>
            ) : (
              <TooltipComponent
                shownContent={
                  <Button disabled>
                    <LucidePlus size={16} className="mr-2" />
                    <span>Submit a project</span>
                  </Button>
                }
                tooltipContent={
                  <>
                    <p>You need to connect your wallet to contribute.</p>
                    <p>Make sure you are on a supported chain.</p>
                  </>
                }
              />
            )}
          </div>
          <p className="max-w-[700px] text-lg text-muted-foreground">
            Explore the latest projects campaigns listed on our platform.
          </p>
        </div>
        <div className="grow overflow-auto">
          {tags ? (
            <ComboboxComponent
              options={tags}
              header="Tags"
              type="tag"
              onChange={handleTagChange}
              canClear
            />
          ) : null}
          {loading ? (
            <DataTableSkeleton columns={columnsSkeleton} rowCount={10} />
          ) : error ? (
            "There was an error fetching the projects. Please try again later."
          ) : (
            // @ts-ignore
            <DataTable columns={columns} data={formatData(projects)} />
          )}
        </div>
      </section>
    </ClientOnly>
  )
}
