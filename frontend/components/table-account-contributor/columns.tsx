// ! ADD FILTERING (address)
// ! Add percentages
"use client"

import { ColumnDef, Row } from "@tanstack/react-table"
import {
  ArrowDown01,
  ArrowDown10,
  ArrowUpDown,
  LucideArrowDownRight,
  LucideArrowUpRight,
  LucideCheckCircle2,
  LucideHourglass,
  LucidePlus,
  LucideSparkle,
  LucideXCircle,
  Sparkles,
} from "lucide-react"

import { ContributionTable } from "@/types/contributions"

import AddressComponent from "../ui-extended/address"
import CurrencyComponent from "../ui-extended/currency"
import DurationComponent from "../ui-extended/duration"
import ElapsedTimeComponent from "../ui-extended/elapsed-time"
import InfoComponent from "../ui-extended/info"
import TooltipComponent from "../ui-extended/tooltip"
import { Button } from "../ui/button"
import { Skeleton } from "../ui/skeleton"

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
    row.original.project.lastActivityAt * 1000
  ).toLocaleDateString()

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
  const startDate = new Date(Number(row.original?.startedAt) * 1000)
  const endDate = new Date(Number(row.original?.endsAt) * 1000)
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
      <p className="flex items-center text-sm text-muted-foreground gap-2">
        {((amountDistributed / amountStored) * 100).toFixed(2)}%
        <InfoComponent content="The percentage of the total amount stored that has been sent to the project already." />
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
      <p className="flex items-center text-sm text-muted-foreground gap-2">
        {((amountStored / totalStored) * 100).toFixed(2)}%
        <InfoComponent content="The percentage of your total stored contributions." />
      </p>
    </>
  )
}

const ActionsCell: React.FC<CellProps> = ({ row }) => {
  // Projects page
  return null
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
    accessorKey: "amountStored",
    header: ({ column }) => {
      return (
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span>Expected</span>
            <InfoComponent content="The amount stored in the contributor account yet to be sent to the project." />
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
    id: "actions",
    cell: ({ row }) => <ActionsCell row={row} />,
  },
]

export const columnsSkeleton: ColumnDef<ContributionTable>[] = columns.map(
  (column) => {
    return {
      ...column,
      cell: ({ row }) => <Skeleton className="h-[16px] w-[100px]" />,
    }
  }
)
