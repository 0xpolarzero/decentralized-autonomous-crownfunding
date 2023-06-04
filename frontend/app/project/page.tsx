"use client"

import { useEffect, useState } from "react"

import { client } from "@/config/apollo-client"
import { GET_PROJECT_BY_SLUG_CONTRACT } from "@/config/constants/subgraphQueries"
import { Skeleton } from "@/components/ui/skeleton"

export default function ProjectPage() {
  const [project, setProject] = useState(null)
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(true)

  const fetchProject = async () => {
    // 'https://.../project?address=0x1234'
    const projectAddress = new URLSearchParams(window.location.search).get(
      "address"
    )

    console.log(projectAddress)
    try {
      const { data } = await client.query({
        query: GET_PROJECT_BY_SLUG_CONTRACT,
        variables: { slug: projectAddress },
      })

      if (data && data.projects) {
        setProject(data.projects[0])
      } else {
        setError(true)
      }

      setLoading(false)
    } catch (err) {
      setError(true)
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProject()
  }, [])

  return (
    <section className="container grid items-center gap-6 pb-8 pt-6 md:py-10">
      <div className="flex max-w-[980px] flex-col items-start gap-2">
        {loading ? (
          <Skeleton className="h-[200px] w-[100%]" />
        ) : error ? (
          <div className="text-muted-foreground">
            <p>
              There was an error retrieving the contract at the provided
              address.
            </p>
            <p>Please make sure the address is correct and try again.</p>
            <br className="hidden sm:inline" />
            <p>{new URLSearchParams(window.location.search).get("address")}</p>
          </div>
        ) : (
          <div className="flex flex-col items-start gap-2">
            <div className="flex items-center gap-2">
              <div className="text-4xl font-bold">{project?.name}</div>
              <div className="text-sm text-gray-500">{project?.status}</div>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-2xl font-bold">{project?.description}</div>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-2xl font-bold">{project?.address}</div>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-2xl font-bold">{project?.createdAt}</div>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-2xl font-bold">
                {project?.lastActivityAt}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
