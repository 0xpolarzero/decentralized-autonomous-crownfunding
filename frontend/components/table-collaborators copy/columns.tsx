"use client"

import { ColumnDef, Row } from "@tanstack/react-table"

import { Collaborator } from "@/types/projects"

import AddressComponent from "../ui-extended/address"
import { Skeleton } from "../ui/skeleton"

type CellProps = {
  row: Row<Collaborator[] | undefined>
}

/* -------------------------------------------------------------------------- */
/*                                    ROWS                                    */
/* -------------------------------------------------------------------------- */

const CollaboratorAddressCell: React.FC<CellProps> = ({ row }) => {
  return <AddressComponent address={row.getValue("address")} tryEns large />
}

const CollaboratorShareCell: React.FC<CellProps> = ({ row }) => {
  return row.getValue("share")
}

const ActionsCell: React.FC<CellProps> = ({ row }) => {
  return null
}

/* -------------------------------------------------------------------------- */
/*                                   COLUMNS                                  */
/* -------------------------------------------------------------------------- */

export const columns: ColumnDef<Collaborator[] | undefined>[] = [
  {
    accessorKey: "address",
    header: "Address",
    cell: ({ row }) => <CollaboratorAddressCell row={row} />,
  },
  {
    accessorKey: "share",
    header: "Share (%)",
    cell: ({ row }) => <CollaboratorShareCell row={row} />,
  },
  {
    id: "actions",
    cell: ({ row }) => <ActionsCell row={row} />,
  },
]

export const columnsSkeleton: ColumnDef<Collaborator[] | undefined>[] =
  columns.map((column) => {
    return {
      ...column,
      cell: ({ row }) => <Skeleton className="h-[16px] w-[100px]" />,
    }
  })
