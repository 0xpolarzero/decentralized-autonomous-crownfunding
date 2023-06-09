"use client"

import { ColumnDef, Row } from "@tanstack/react-table"
import {
  ArrowDown01,
  ArrowDown10,
  ArrowUpDown,
  LucideHourglass,
  Sparkles,
} from "lucide-react"

import { ContributionTable } from "@/types/contributions"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import AddressComponent from "@/components/ui-extended/address"
import CurrencyComponent from "@/components/ui-extended/currency"
import DurationComponent from "@/components/ui-extended/duration"
import InfoComponent from "@/components/ui-extended/info"
import TooltipComponent from "@/components/ui-extended/tooltip"

type CellProps = {
  row: Row<ContributionTable | undefined>
}

/* -------------------------------------------------------------------------- */
/*                                    ROWS                                    */
/* -------------------------------------------------------------------------- */

const ContributorOwnerAndAccountAddress: React.FC<CellProps> = ({ row }) => {
  return (
    <>
      <p>
        <AddressComponent address={row.getValue("owner")} />
      </p>
      <p className="text-sm text-muted-foreground">
        <AddressComponent
          // @ts-ignore
          address={row.original?.accountContract as `0x${string}`}
        />
      </p>
    </>
  )
}

const ContributorPeriod: React.FC<CellProps> = ({ row }) => {
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

const ContributorAmountDistributed: React.FC<CellProps> = ({ row }) => {
  const amountDistributed = row.original?.amountDistributed || 0
  const totalRaised = row.original?.totalRaised || 0
  const percentage = totalRaised
    ? ((amountDistributed / totalRaised) * 100).toFixed(2)
    : 0

  return (
    <>
      <p>
        <CurrencyComponent
          amount={row.getValue("amountDistributed")}
          currency="native"
        />
      </p>
      <p className="text-sm text-muted-foreground">{percentage}%</p>
    </>
  )
}

const ContributorAmountStored: React.FC<CellProps> = ({ row }) => {
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
      <p className="text-sm text-muted-foreground">
        {((amountStored / totalStored) * 100).toFixed(2)}%
      </p>
    </>
  )
}

/* -------------------------------------------------------------------------- */
/*                                   COLUMNS                                  */
/* -------------------------------------------------------------------------- */

export const columns: ColumnDef<ContributionTable | undefined>[] = [
  {
    accessorKey: "owner",
    header: () => {
      return (
        <div className="flex items-center gap-2">
          <span>Contributor / account</span>
          <InfoComponent content="The address of the contributor and the address of their contributor account." />
        </div>
      )
    },
    cell: ({ row }) => <ContributorOwnerAndAccountAddress row={row} />,
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
    cell: ({ row }) => <ContributorPeriod row={row} />,
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
    cell: ({ row }) => <ContributorAmountDistributed row={row} />,
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
    cell: ({ row }) => <ContributorAmountStored row={row} />,
  },
]

export const columnsSkeleton: ColumnDef<ContributionTable | undefined>[] =
  columns.map((column) => {
    return {
      ...column,
      cell: () => <Skeleton className="h-[16px] w-[100px]" />,
    }
  })
