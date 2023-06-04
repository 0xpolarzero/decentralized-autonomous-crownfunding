"use client"

import React, { useEffect, useState } from "react"
import { useApolloClient, useQuery } from "@apollo/client"

import {
  GET_PROJECTS,
  GET_PROJECT_BY_SLUG,
} from "@/config/constants/subgraphQueries"
import { buttonVariants } from "@/components/ui/button"
import { DataTable } from "@/components/ui/data-table"
import { Input } from "@/components/ui/input"
import { Table } from "@/components/ui/table"

import { columns } from "./projects-table/columns"
import formatData from "./projects-table/format-data"

export default function ProjectsPage() {
  const client = useApolloClient()
  const {
    data: initialData,
    error,
    loading,
  } = useQuery(GET_PROJECTS, {
    variables: { amountPerPage: 1000, skip: 0 },
  })

  const [projects, setProjects] = useState([])
  const [search, setSearch] = useState("")
  const [searchLoading, setSearchLoading] = useState(false)

  const handleSearchChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearch(value)

    if (e.target.value) {
      try {
        const { data: searchData } = await client.query({
          query: GET_PROJECT_BY_SLUG,
          variables: { slug: e.target.value },
        })
        setProjects(searchData.projects)
      } catch (error) {
        console.error(error)
      }
    } else {
      setProjects(initialData.projects)
    }
  }

  const clearSearch = () => {
    setSearch("")
    setProjects(initialData.projects)
  }

  useEffect(() => {
    if (initialData && initialData.projects) setProjects(initialData.projects)
    if (initialData) console.log(initialData)
  }, [initialData])

  return (
    <section className="container grid items-center gap-6 pb-8 pt-6 md:py-10">
      <div className="flex max-w-[980px] flex-col items-start gap-2">
        <div className="my-4 flex w-full items-center space-x-2">
          <Input
            type="search"
            value={search}
            onChange={handleSearchChange}
            placeholder="Search a project by name, address or collaborator address"
          />
          {/* <button className={buttonVariants()}>Search</button> */}
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
          Latest Projects
        </h1>
        <p className="max-w-[700px] text-lg text-muted-foreground">
          Explore the latest projects on our platform. Use the search function
          to find specific projects or collaborators.
        </p>
      </div>
      <div className="flex-grow overflow-auto">
        {
          loading ? (
            "loading skeleton"
          ) : error ? (
            "error skeleton"
          ) : (
            <DataTable columns={columns} data={formatData(projects)} />
          )
          // <Table data={filteredProjects} />{" "}
        }
      </div>
    </section>
  )
}
