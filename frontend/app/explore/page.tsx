"use client"

import React, { useEffect, useState } from "react"
import { useQuery } from "@apollo/client"

import { Project } from "@/types/queries"
import { GET_PROJECTS } from "@/config/constants/subgraphQueries"
import { buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import ComboboxComponent, { OptionProps } from "@/components/ui-custom/combobox"
import { DataTable } from "@/components/ui-custom/data-table"
import { DataTableSkeleton } from "@/components/ui-custom/data-table-skeleton"

import { columns, columnsSkeleton } from "./projects-table/columns"
import formatData from "./projects-table/format-data"

export default function ExplorePage() {
  const {
    data: initialData,
    error,
    loading,
  } = useQuery(GET_PROJECTS, {
    variables: { amountPerPage: 1000, skip: 0 },
  })

  const [projects, setProjects] = useState<Project[]>([])
  const [tags, setTags] = useState<OptionProps[]>([])
  const [searchValue, setSearchValue] = useState<string>("")

  const handleSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value)
    // We cannot perform 'OR' searches, or search an array of strings with The Graph
    // so right now we're better off querying a large amount of projects and
    // filtering them on the client side
    if (!e.target.value || e.target.value.length < 1) {
      setProjects(initialData.projects)
      return
    }

    const filtered = initialData.projects.filter(
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
    setProjects(initialData.projects)
  }

  const handleTagChange = (value: string) => {
    if (!initialData || !initialData.projects) return

    if (!value || value === "") {
      setProjects(initialData.projects)
      return
    }

    const filtered = initialData.projects.filter((project: Project) =>
      project.tags.includes(value)
    )

    setProjects(filtered)
  }

  useEffect(() => {
    if (initialData && initialData.projects) {
      setProjects(initialData.projects)
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
