"use client"

import React, { useEffect, useState } from "react"
import useGlobalStore from "@/stores/useGlobalStore"
import { useQuery } from "@apollo/client"

import { Project } from "@/types/queries"
import { GET_PROJECTS } from "@/config/constants/subgraphQueries"
import { networkConfig } from "@/config/network"
import { buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import ComboboxComponent, { OptionProps } from "@/components/ui-custom/combobox"
import { DataTable } from "@/components/ui-custom/data-table"
import { DataTableSkeleton } from "@/components/ui-custom/data-table-skeleton"

import { columns, columnsSkeleton } from "./table-projects/columns"
import formatData from "./table-projects/format-data"

export default function ExplorePage() {
  const {
    data: initialData,
    error,
    loading,
  } = useQuery(GET_PROJECTS, {
    variables: { amountPerPage: 1000, skip: 0 },
  })
  const currentNetwork = useGlobalStore((state) => state.currentNetwork)

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

  const withNetworkAppened = (data: Project[]) => {
    const networkInfo =
      currentNetwork || networkConfig.networks[networkConfig.defaultNetwork]

    return data.map((project) => ({
      ...project,
      network: networkInfo.name,
      blockExplorer: `${networkInfo.blockExplorer.url}/address/${project.projectContract}`,
    }))
  }

  const initProjects = () => {
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
  }

  useEffect(() => {
    if (initialData && initialData.projects) initProjects()
  }, [initialData])

  return (
    <section className="container grid items-center gap-6 pb-8 pt-6 md:py-10">
      <div className="flex max-w-[980px] flex-col items-start gap-2">
        <div className="my-4 flex w-full items-center space-x-2">
          <Input
            type="search"
            value={searchValue}
            onChange={handleSearch}
            placeholder="Search a project by name, address or projects involving a collaborator"
          />
          {/* <button className={buttonVariants()} onClick={onSearch}>
            Search
          </button> */}
          <button
            className={buttonVariants({
              variant: "outline",
            })}
            onClick={clearSearch}
          >
            Clear
          </button>
        </div>
        <h1 className="text-3xl font-extrabold leading-tight tracking-tighter md:text-4xl">
          Latest projects
        </h1>
        <p className="max-w-[700px] text-lg text-muted-foreground">
          Explore the latest projects campaigns listed on our platform.
        </p>
      </div>
      <div className="grow overflow-auto">
        {tags ? (
          <ComboboxComponent
            options={tags}
            type="tag"
            onChange={handleTagChange}
          />
        ) : null}
        {loading ? (
          <DataTableSkeleton columns={columnsSkeleton} rowCount={10} />
        ) : error ? (
          "error"
        ) : (
          <DataTable columns={columns} data={formatData(projects)} />
        )}
      </div>
    </section>
  )
}
