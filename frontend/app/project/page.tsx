"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import useGlobalStore from "@/stores/useGlobalStore"
import { LucideBanknote } from "lucide-react"

import { Project, ProjectTable } from "@/types/projects"
import { client } from "@/config/apollo-client"
import { GET_PROJECT_BY_SLUG_CONTRACT } from "@/config/constants/subgraphQueries"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogTrigger } from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import ContributeDialogComponent from "@/components/contribute-dialog"
import { columns as columnsCollaborators } from "@/components/table-collaborators/columns"
import formatDataCollaborators from "@/components/table-collaborators/format-data"
import { columns as columnsContributors } from "@/components/table-contributors/columns"
import formatDataContributors from "@/components/table-contributors/format-data"
import CurrencyComponent from "@/components/ui-custom/currency"
import { DataTable } from "@/components/ui-custom/data-table"
import { DataTableSkeleton } from "@/components/ui-custom/data-table-skeleton"
import ElapsedTimeComponent from "@/components/ui-custom/elapsed-time"
import InfoComponent from "@/components/ui-custom/info"
import TooltipComponent from "@/components/ui-custom/tooltip"

export default function ProjectPage() {
  const { currentNetwork, hasContributorAccount } = useGlobalStore((state) => ({
    currentNetwork: state.currentNetwork,
    hasContributorAccount: state.hasContributorAccount,
  }))

  const [project, setProject] = useState<Project | null>(null)
  const [error, setError] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(true)

  const createdAtFormatted = project?.createdAt
    ? new Date(project?.createdAt * 1000)
    : undefined
  const lastActivityAtFormatted = project?.lastActivityAt
    ? new Date(project?.lastActivityAt * 1000)
    : undefined

  const isStillActive = (): boolean => {
    const lastActivity = lastActivityAtFormatted?.getTime() || 0
    return new Date().getTime() - lastActivity < 1000 * 60 * 60 * 24 * 30 // 30 days
  }

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
      <div className="flex max-w-[1400px] flex-col items-start gap-2">
        {loading ? (
          <Skeleton className="h-[200px] w-[100%]" />
        ) : error || !project ? (
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
          <div className="flex w-[100%] flex-col items-start gap-2">
            {/* -------------------------------------------------------------------------- */
            /*                                   HEADER                                   */
            /* -------------------------------------------------------------------------- */}
            <div className="flex w-[100%] items-center justify-between gap-2">
              <div className="text-3xl">{project?.name}</div>
              <Dialog>
                <DialogTrigger asChild>
                  {hasContributorAccount && isStillActive() ? (
                    <Button>
                      <LucideBanknote size={16} className="mr-2" />
                      <span>Contribute</span>
                    </Button>
                  ) : (
                    <TooltipComponent
                      shownContent={
                        <Button disabled>
                          <LucideBanknote size={16} className="mr-2" />
                          <span>Contribute</span>
                        </Button>
                      }
                      tooltipContent={
                        isStillActive() ? (
                          <>
                            <p>
                              You need to connect your wallet to contribute.
                            </p>
                            <p>
                              Make sure you are on a supported chain and you
                              have a contributor account.
                            </p>
                          </>
                        ) : (
                          <>This project is no longer active.</>
                        )
                      }
                    />
                  )}
                </DialogTrigger>
                <ContributeDialogComponent
                  data={project as ProjectTable | null}
                />
              </Dialog>
            </div>

            {/* -------------------------------------------------------------------------- */
            /*                                   CONTENT                                  */
            /* -------------------------------------------------------------------------- */}
            <blockquote className="my-2 border-l-2 pl-6 italic">
              {project?.description}
            </blockquote>

            <div>
              <span className="flex items-center gap-2 text-lg opacity-80">
                Links{" "}
                <InfoComponent
                  type="warning"
                  content="The links provided are not verified by the platform. Please proceed with caution."
                />
              </span>
              <div className="mb-2 flex w-[100%] items-center text-sm text-muted-foreground">
                {project?.links?.length === 0 ? (
                  <span className="opacity-50">No links provided</span>
                ) : (
                  project?.links.map((link, index) => (
                    <>
                      <Link
                        key={index}
                        href={link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline"
                      >
                        {link.replace("https://", "").replace("http://", "")}
                      </Link>
                      {index < project?.links?.length - 1 && (
                        <span className="mx-2 opacity-50">|</span>
                      )}
                    </>
                  ))
                )}
              </div>
            </div>

            <div>
              <span className="text-lg opacity-80">Categories</span>
              <div className="mb-2 mt-1 flex w-[100%] items-center text-sm text-muted-foreground">
                {project?.tags?.length === 0 ? (
                  <span className="opacity-50">No links provided</span>
                ) : (
                  project?.tags.map((tag, index) => (
                    <Badge variant="outline" className="mr-2">
                      {tag}
                    </Badge>
                  ))
                )}
              </div>
            </div>

            {/* -------------------------------------------------------------------------- */
            /*                                FUNDS RAISED                                */
            /* -------------------------------------------------------------------------- */}
            <div className="flex w-[100%] items-center justify-between gap-2">
              <span className="text-lg opacity-80">Funds raised</span>
              <span className="text-2xl font-medium">
                <CurrencyComponent
                  amount={Number(project?.totalRaised) || 0}
                  currency="native"
                />
              </span>
            </div>
            {/**
             * @dev A table with timed contributions can be done but needs to add records to contributions (see subgraph schema)
             * @dev It can be added later
             * @dev See @/components/table-raised for the table (to be continued)
             */}

            {/* <div className="w-[100%]">
              {loading ? (
                <DataTableSkeleton columns={columns} rowCount={10} />
              ) : error ? (
                "There was an error retrieving the data."
              ) : (
                <DataTable columns={columns} data={project?.contributors} />
              )}
            </div> */}

            {/* -------------------------------------------------------------------------- */
            /*                                   FOOTER                                   */
            /* -------------------------------------------------------------------------- */}
            <div className="my-2 flex w-[100%] justify-between gap-4 text-sm text-muted-foreground">
              <TooltipComponent
                shownContent={
                  <>
                    Created{" "}
                    <ElapsedTimeComponent
                      timestamp={createdAtFormatted?.getTime()}
                    />
                  </>
                }
                tooltipContent={createdAtFormatted?.toLocaleDateString()}
              />
              <TooltipComponent
                shownContent={
                  <>
                    Last active{" "}
                    <ElapsedTimeComponent
                      timestamp={lastActivityAtFormatted?.getTime()}
                    />
                  </>
                }
                tooltipContent={lastActivityAtFormatted?.toLocaleDateString()}
              />
              <Link
                className="text-sm text-muted-foreground underline"
                href={`${currentNetwork?.blockExplorer.url}address/${project?.projectContract}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                See contract on block explorer
              </Link>
            </div>
            <Separator />

            {/* -------------------------------------------------------------------------- */
            /*                                COLLABORATORS                               */
            /* -------------------------------------------------------------------------- */}
            <span className="text-lg opacity-80">Collaborators</span>
            <div className="w-[100%]">
              {loading ? (
                <DataTableSkeleton
                  columns={columnsCollaborators}
                  rowCount={10}
                />
              ) : error ? (
                "There was an error retrieving the data."
              ) : (
                <DataTable
                  columns={columnsCollaborators}
                  data={formatDataCollaborators(
                    project?.collaborators,
                    project?.shares
                  )}
                />
              )}
            </div>

            {/* -------------------------------------------------------------------------- */
            /*                                CONTRIBUTORS                                */
            /* -------------------------------------------------------------------------- */}
            <span className="text-lg opacity-80">Contributors</span>
            <div className="w-[100%]">
              {loading ? (
                <DataTableSkeleton
                  columns={columnsContributors}
                  rowCount={10}
                />
              ) : error ? (
                "There was an error retrieving the data."
              ) : (
                <DataTable
                  columns={columnsContributors}
                  data={formatDataContributors(
                    project?.contributors,
                    project?.totalRaised
                  )}
                />
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
