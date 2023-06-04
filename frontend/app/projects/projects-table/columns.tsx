"use client"

import { ColumnDef } from "@tanstack/react-table"

import AddressComponent from "@/components/ui-custom/address"
import { ProjectTable } from "@/app/projects/projects-table/types"

export const columns: ColumnDef<ProjectTable>[] = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "status",
    header: "Status",
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
  },
]
