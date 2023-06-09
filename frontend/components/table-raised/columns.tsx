"use client"

import { ColumnDef, Row } from "@tanstack/react-table"

import { Contribution } from "@/types/contributions"
import { Skeleton } from "@/components/ui/skeleton"

type CellProps = {
  row: Row<Contribution[] | undefined>
}

/* -------------------------------------------------------------------------- */
/*                                    ROWS                                    */
/* -------------------------------------------------------------------------- */

const ContributionsWeekCell: React.FC<CellProps> = ({ row }) => {
  return row.getValue("amountDistributed")
}

const ContributionsMonthCell: React.FC<CellProps> = ({ row }) => {
  return row.getValue("amountDistributed")
}

const ContributionsYearCell: React.FC<CellProps> = ({ row }) => {
  return row.getValue("amountDistributed")
}

const ContributionsTotalCell: React.FC<CellProps> = ({ row }) => {
  return row.getValue("amountDistributed")
}

const ActionsCell: React.FC<CellProps> = ({ row }) => {
  return row.getValue("amountDistributed")
}

/* -------------------------------------------------------------------------- */
/*                                   COLUMNS                                  */
/* -------------------------------------------------------------------------- */

export const columns: ColumnDef<Contribution[] | undefined>[] = [
  {
    accessorKey: "week",
    header: "Last 7 days",
    cell: ({ row }) => <ContributionsWeekCell row={row} />,
  },
  {
    accessorKey: "month",
    header: "Last 30 days",
    cell: ({ row }) => <ContributionsMonthCell row={row} />,
  },
  {
    accessorKey: "year",
    header: "Last year",
    cell: ({ row }) => <ContributionsYearCell row={row} />,
  },
  {
    accessorKey: "total",
    header: "Total",
    cell: ({ row }) => <ContributionsTotalCell row={row} />,
  },
  {
    id: "actions",
    cell: ({ row }) => <ActionsCell row={row} />,
  },
]

export const columnsSkeleton: ColumnDef<Contribution[] | undefined>[] =
  columns.map((column) => {
    return {
      ...column,
      cell: () => <Skeleton className="h-[16px] w-[100px]" />,
    }
  })
