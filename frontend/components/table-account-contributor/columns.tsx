"use client"

import { useState } from "react"
import Link from "next/link"
import useGlobalStore from "@/stores/useGlobalStore"
import { ColumnDef, Row } from "@tanstack/react-table"
import {
  ArrowDown01,
  ArrowDown10,
  ArrowUpDown,
  LucideCheckCircle2,
  LucideHourglass,
  LucideInfo,
  LucideShare2,
  LucideXCircle,
  MoreHorizontal,
  Sparkles,
} from "lucide-react"

import { ContributionTable } from "@/types/contributions"
import { networkConfig } from "@/config/network"
import { siteConfig } from "@/config/site"
import useCopyToClipboard from "@/hooks/copy-to-clipboard"
import { Button } from "@/components/ui/button"
import { Dialog } from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/components/ui/use-toast"
import ButtonEditContributionComponent from "@/components/table-account-contributor/button-edit-contribution"
import AddressComponent from "@/components/ui-extended/address"
import CurrencyComponent from "@/components/ui-extended/currency"
import DurationComponent from "@/components/ui-extended/duration"
import ElapsedTimeComponent from "@/components/ui-extended/elapsed-time"
import InfoComponent from "@/components/ui-extended/info"
import TooltipComponent from "@/components/ui-extended/tooltip"

type CellProps = {
  row: Row<ContributionTable>
}

/* -------------------------------------------------------------------------- */
/*                                    ROWS                                    */
/* -------------------------------------------------------------------------- */

const ProjectInfo: React.FC<CellProps> = ({ row }) => {
  const name = row.original?.project.name
  const address = row.original?.project.projectContract as `0x${string}`

  return (
    <>
      <p>{name}</p>
      <p className="text-sm text-muted-foreground">
        <AddressComponent address={address} />
      </p>
    </>
  )
}

const StatusCell: React.FC<CellProps> = ({ row }) => {
  const status: string = row.getValue("projectStatus")
  const lastActivityAt: string = new Date(
    Number(row.original.project.lastActivityAt) * 1000
  ).toLocaleString()

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

const ContributionPeriod: React.FC<CellProps> = ({ row }) => {
  const startDate = new Date(row.original?.startedAt * 1000)
  const endDate = new Date(row.original?.endsAt * 1000)
  return (
    <>
      <p>
        {startDate.toLocaleDateString()} - {endDate.toLocaleDateString()}
      </p>
      <p className="text-sm text-muted-foreground">
        <DurationComponent
          startTimestamp={Number(row.original?.startedAt) * 1000}
          endTimestamp={Number(row.original?.endsAt) * 1000}
        />
      </p>
    </>
  )
}

const ContributionAmountDistributed: React.FC<CellProps> = ({ row }) => {
  const amountDistributed = row.original?.amountDistributed || 0
  const amountStored = row.original?.amountStored || 0

  return (
    <>
      <p>
        <CurrencyComponent
          amount={row.getValue("amountDistributed")}
          currency="native"
        />
      </p>
      <p className="flex items-center gap-2 text-sm text-muted-foreground">
        {((amountDistributed / amountStored) * 100).toFixed(2)}%
        <InfoComponent content="The percentage of the total amount stored that has been sent to the project already." />
      </p>
    </>
  )
}

const ContributionAmountPending: React.FC<CellProps> = ({ row }) => {
  const pending = row.original.pending.find((c) => c.id === row.original.id)
  const pendingAmount = pending?.amount || 0
  const percentage = (pendingAmount / row.original.amountStored) * 100

  if (!pending) return <span className="text-muted-foreground">-</span>

  return (
    <>
      <p>
        <CurrencyComponent amount={pending.amount} currency="native" />
      </p>
      <p className="flex items-center gap-2 text-sm text-muted-foreground">
        {percentage.toFixed(2)}%
        <InfoComponent content="The percentage of the total amount stored that should be sent to the project at the current time." />
      </p>
    </>
  )
}

const ContributionAmountStored: React.FC<CellProps> = ({ row }) => {
  const amountStored = row.original?.amountStored || 0
  const totalStored = row.original?.totalStored || 0

  return (
    <>
      <p>
        <CurrencyComponent
          amount={row.getValue("amountStored")}
          currency="native"
        />
      </p>
      <p className="flex items-center gap-2 text-sm text-muted-foreground">
        {((amountStored / totalStored) * 100).toFixed(2)}%
        <InfoComponent content="The percentage of your total stored contributions." />
      </p>
    </>
  )
}

const ActionsCell: React.FC<CellProps> = ({ row }) => {
  const currentNetwork = useGlobalStore((state) => state.currentNetwork)

  const copyToClipboard = useCopyToClipboard()

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
          <Link
            href={`/project?address=${row.original.project.projectContract}`}
          >
            <DropdownMenuItem>
              <LucideInfo size={16} className="mr-2" />
              Show project&apos;s page
            </DropdownMenuItem>
          </Link>
          <DropdownMenuItem
            onClick={() =>
              copyToClipboard(
                `${siteConfig.url}/project?address=${row.original.project.projectContract}`
              )
            }
          >
            <LucideShare2 size={16} className="mr-2" />
            Share this campain
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <ButtonEditContributionComponent
            amounts={{
              stored: row.original.amountStored,
              distributed: row.original.amountDistributed,
            }}
            contributionIndex={row.original.index}
            projectLastActivityAt={Number(row.original.project.lastActivityAt)}
          />
        </DropdownMenuContent>
      </DropdownMenu>
    </Dialog>
  )
}

/* -------------------------------------------------------------------------- */
/*                                   COLUMNS                                  */
/* -------------------------------------------------------------------------- */

export const columns: ColumnDef<ContributionTable>[] = [
  {
    accessorKey: "project",
    header: () => {
      return (
        <div className="flex items-center gap-2">
          <span>Project</span>
          <InfoComponent content="The name of the project and address of its contract." />
        </div>
      )
    },
    cell: ({ row }) => <ProjectInfo row={row} />,
  },
  {
    accessorKey: "projectStatus",
    header: "Status",
    cell: ({ row }) => <StatusCell row={row} />,
  },
  {
    accessorKey: "startedAt",
    header: ({ column }) => {
      return (
        <div className="flex items-center justify-between gap-2">
          <span>Contribution period</span>
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
                  <LucideHourglass className="ml-2 h-4 w-4" />
                ) : column.getIsSorted() === "desc" ? (
                  <Sparkles className="ml-2 h-4 w-4" />
                ) : (
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                )}
              </Button>
            }
            tooltipContent={
              column.getIsSorted() === "asc"
                ? "Showing oldest first"
                : column.getIsSorted() === "desc"
                ? "Showing newest first"
                : "Sort by creation date"
            }
          />
        </div>
      )
    },
    cell: ({ row }) => <ContributionPeriod row={row} />,
  },
  {
    accessorKey: "amountStored",
    header: ({ column }) => {
      return (
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span>Initial</span>
            <InfoComponent content="The amount initially stored in the contributor account for this contribution." />
          </div>
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
    cell: ({ row }) => <ContributionAmountStored row={row} />,
  },
  {
    accessorKey: "amountDistributed",
    header: ({ column }) => {
      return (
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span>Contributed</span>
            <InfoComponent content="The amount already sent to the project." />
          </div>
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
    cell: ({ row }) => <ContributionAmountDistributed row={row} />,
  },
  {
    accessorKey: "amountPending",
    header: ({ column }) => {
      return (
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span>Pending</span>
            <InfoComponent content="The amount that should be distributed to the project at the current time." />
          </div>
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
    cell: ({ row }) => <ContributionAmountPending row={row} />,
  },

  {
    id: "actions",
    cell: ({ row }) => <ActionsCell row={row} />,
  },
]

export const columnsSkeleton: ColumnDef<ContributionTable>[] = columns.map(
  (column) => {
    return {
      ...column,
      cell: () => <Skeleton className="h-[16px] w-[100px]" />,
    }
  }
)
