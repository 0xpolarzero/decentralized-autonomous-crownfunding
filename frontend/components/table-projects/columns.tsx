"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import useGlobalStore from "@/stores/useGlobalStore"
import { Cell, ColumnDef, Row } from "@tanstack/react-table"
import {
  ArrowDown01,
  ArrowDown10,
  ArrowUpDown,
  LucideArrowDownRight,
  LucideArrowUpRight,
  LucideBanknote,
  LucideCheckCircle2,
  LucideExternalLink,
  LucideInfo,
  LucideShare2,
  LucideXCircle,
  MoreHorizontal,
} from "lucide-react"

import { ProjectTable } from "@/types/projects"
import { networkConfig } from "@/config/network"
import { siteConfig } from "@/config/site"
import useCopyToClipboard from "@/hooks/copy-to-clipboard"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogTrigger } from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Skeleton } from "@/components/ui/skeleton"
import ContributeDialogComponent from "@/components/contribute-dialog"
import AddressComponent from "@/components/ui-extended/address"
import CurrencyComponent from "@/components/ui-extended/currency"
import ElapsedTimeComponent from "@/components/ui-extended/elapsed-time"
import TooltipComponent from "@/components/ui-extended/tooltip"

type CellProps = {
  row: Row<ProjectTable>
}

/* -------------------------------------------------------------------------- */
/*                                    name                                    */
/* -------------------------------------------------------------------------- */

const NameCell: React.FC<CellProps> = ({ row }: { row: Row<ProjectTable> }) =>
  row.getValue("name")

/* -------------------------------------------------------------------------- */
/*                                   status                                   */
/* -------------------------------------------------------------------------- */

const StatusCell: React.FC<CellProps> = ({ row }) => {
  const status: string = row.getValue("status")
  const lastActivityAt: string = row.original.lastActivityAt

  if (status)
    return (
      <TooltipComponent
        shownContent={
          <span className="flex items-center space-x-2">
            <LucideCheckCircle2 size={16} color="var(--green)" />{" "}
            <span>Active</span>
          </span>
        }
        tooltipContent={
          <>
            Last activity{" "}
            <ElapsedTimeComponent
              timestamp={new Date(lastActivityAt).getTime()}
            />{" "}
            ({lastActivityAt})
          </>
        }
      />
    )

  return (
    <TooltipComponent
      shownContent={
        <span className="flex items-center space-x-2">
          <LucideXCircle size={16} color="var(--yellow)" />
          <span>Inactive</span>
        </span>
      }
      tooltipContent={
        <>
          Last activity{" "}
          <ElapsedTimeComponent
            timestamp={new Date(lastActivityAt).getTime()}
          />{" "}
          ({lastActivityAt})
        </>
      }
    />
  )
}

/* -------------------------------------------------------------------------- */
/*                                collaborators                               */
/* -------------------------------------------------------------------------- */

const CollaboratorsCell: React.FC<CellProps> = ({ row }) => {
  const addresses: `0x${string}`[] = row.getValue("collaborators")
  return (
    <div className="space-y-2">
      {addresses.map((collaborator, i) => {
        return (
          <div key={i} className="whitespace-pre-line">
            <AddressComponent address={collaborator} tryEns />
          </div>
        )
      })}
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*                                 totalRaised                                */
/* -------------------------------------------------------------------------- */

const TotalRaisedCell: React.FC<CellProps> = ({ row }) => {
  const totalRaised: number = row.getValue("totalRaised")
  return <CurrencyComponent amount={Number(totalRaised)} currency="native" />
}

/* -------------------------------------------------------------------------- */
/*                                    links                                   */
/* -------------------------------------------------------------------------- */

const LinksCell: React.FC<CellProps> = ({ row }) => {
  const links: string[] = row.getValue("links")
  return (
    <div className="space-y-2">
      {links.map((link, i) => {
        return (
          <div key={i} className="whitespace-pre-line">
            <a href={link} target="_blank" rel="noopener noreferrer">
              {link.replace("https://", "")}
            </a>
          </div>
        )
      })}
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*                                    tags                                    */
/* -------------------------------------------------------------------------- */

const TagsCell: React.FC<CellProps> = ({ row }) => {
  const tags: string[] = row.getValue("tags")
  if (!tags || !tags.length) return null

  return (
    <div className="flex flex-wrap justify-between gap-2">
      {tags.map((tag, i) => {
        return (
          <Badge key={i} variant="outline">
            {tag}
          </Badge>
        )
      })}
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*                                   actions                                  */
/* -------------------------------------------------------------------------- */

const ActionsCell: React.FC<CellProps> = ({ row }) => {
  const currentNetwork = useGlobalStore((state) => state.currentNetwork)
  const networkInfo =
    currentNetwork || networkConfig.networks[networkConfig.defaultNetwork]

  const isStillActive = (): boolean =>
    new Date().getTime() - new Date(row.original.lastActivityAt).getTime() <
    1000 * 60 * 60 * 24 * 30 // 30 days

  const copyToClipboard = useCopyToClipboard()
  const hasContributorAccount = useGlobalStore(
    (state) => state.hasContributorAccount
  )
  return (
    <Dialog>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <Link href={`/project?address=${row.original.projectContract}`}>
            <DropdownMenuItem>
              <LucideInfo size={16} className="mr-2" />
              Show project&apos;s page
            </DropdownMenuItem>
          </Link>
          <Link href={row.original.blockExplorer} target="_blank">
            <DropdownMenuItem>
              <LucideExternalLink size={16} className="mr-2" />
              Show on {networkInfo.blockExplorer.name}
            </DropdownMenuItem>
          </Link>
          <DropdownMenuItem
            onClick={() =>
              copyToClipboard(
                `${siteConfig.url}/project?address=${row.original.projectContract}`
              )
            }
          >
            <LucideShare2 size={16} className="mr-2" />
            Share this campain
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DialogTrigger asChild>
            {hasContributorAccount && isStillActive() ? (
              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                <LucideBanknote
                  size={16}
                  className="mr-2"
                  color="var(--green)"
                />
                <span style={{ color: "var(--green)" }}>Contribute</span>
              </DropdownMenuItem>
            ) : (
              <TooltipComponent
                shownContent={
                  <DropdownMenuItem disabled>
                    <LucideBanknote
                      size={16}
                      className="mr-2"
                      color="var(--green)"
                    />
                    <span style={{ color: "var(--green)" }}>Contribute</span>
                  </DropdownMenuItem>
                }
                tooltipContent={
                  isStillActive() ? (
                    <>
                      <p>You need to connect your wallet to contribute.</p>
                      <p>
                        Make sure you are on a supported chain and you have a
                        contributor account.
                      </p>
                    </>
                  ) : (
                    <>This project is no longer active.</>
                  )
                }
              />
            )}
          </DialogTrigger>
        </DropdownMenuContent>
      </DropdownMenu>
      <ContributeDialogComponent data={row.original} />
    </Dialog>
  )
}

/* -------------------------------------------------------------------------- */
/*                                   COLUMNS                                  */
/* -------------------------------------------------------------------------- */

export const columns: ColumnDef<ProjectTable>[] = [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => <NameCell row={row} />,
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <StatusCell row={row} />,
  },
  {
    accessorKey: "collaborators",
    header: "Collaborators",
    cell: ({ row }) => <CollaboratorsCell row={row} />,
  },
  {
    accessorKey: "totalRaised",
    header: ({ column }) => {
      return (
        <div className="flex items-center justify-between gap-2">
          <span>Raised</span>
          <TooltipComponent
            shownContent={
              <Button
                variant="ghost"
                className="pl-1 pr-3"
                onClick={() => {
                  column.toggleSorting(column.getIsSorted() === "asc")
                }}
              >
                {column.getIsSorted() === "asc" ? (
                  <ArrowDown01 className="ml-2 h-4 w-4" />
                ) : column.getIsSorted() === "desc" ? (
                  <ArrowDown10 className="ml-2 h-4 w-4" />
                ) : (
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                )}
              </Button>
            }
            tooltipContent={
              column.getIsSorted() === "asc"
                ? "Showing lowest first"
                : column.getIsSorted() === "desc"
                ? "Showing highest first"
                : "Sort by amount raised"
            }
          />
        </div>
      )
    },
    cell: ({ row }) => <TotalRaisedCell row={row} />,
  },
  {
    accessorKey: "links",
    header: "Links",
    cell: ({ row }) => <LinksCell row={row} />,
  },
  {
    accessorKey: "tags",
    header: "Categories",
    cell: ({ row }) => <TagsCell row={row} />,
  },

  {
    // accessorKey: "actions",
    // header: "Actions",
    id: "actions",
    cell: ({ row }) => <ActionsCell row={row} />,
  },
]

export const columnsSkeleton: ColumnDef<ProjectTable>[] = columns.map(
  (column) => {
    return {
      ...column,
      cell: ({ row }) => <Skeleton className="h-[16px] w-[100px]" />,
    }
  }
)
