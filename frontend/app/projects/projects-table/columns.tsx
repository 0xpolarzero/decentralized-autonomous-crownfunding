"use client"

import { ColumnDef } from "@tanstack/react-table"
import { LucideCheckCircle2, LucideXCircle } from "lucide-react"

import { Skeleton } from "@/components/ui/skeleton"
import AddressComponent from "@/components/ui-custom/address"
import CurrencyComponent from "@/components/ui-custom/currency"
import TooltipComponent from "@/components/ui-custom/tooltip"
import { ProjectTable } from "@/app/projects/projects-table/types"

export const columns: ColumnDef<ProjectTable>[] = [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => {
      const name: string = row.getValue("name")
      return (
        <TooltipComponent
          shownContent={name}
          tooltipContent={"Click for more info"}
        />
      )
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status: string = row.getValue("status")
      const lastActivityAt: string = row.original.lastActivityAt
      const timeSinceLastActivity = Date.now() - Date.parse(lastActivityAt)
      const timeSinceLastActivityInDays =
        timeSinceLastActivity / 1000 / 60 / 60 / 24

      if (status)
        return (
          <TooltipComponent
            shownContent={
              <span className="flex items-center space-x-2">
                <LucideCheckCircle2 size={16} color="var(--green)" />{" "}
                <span>Active</span>
              </span>
            }
            tooltipContent={`Last activity ${timeSinceLastActivityInDays.toFixed()} days ago (${lastActivityAt})`}
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
          tooltipContent={`Last activity ${timeSinceLastActivityInDays.toFixed()} days ago (${lastActivityAt})`}
        />
      )
    },
  },
  {
    accessorKey: "collaborators",
    header: "Collaborators",
    cell: ({ row }) => {
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
    },
  },
  {
    accessorKey: "totalRaised",
    header: "Raised",
    cell: ({ row }) => {
      const totalRaised: number = row.getValue("totalRaised")
      return <CurrencyComponent amount={Number(totalRaised)} currency="matic" />
    },
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
