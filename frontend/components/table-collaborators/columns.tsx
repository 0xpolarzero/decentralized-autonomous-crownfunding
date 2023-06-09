"use client"

import { ColumnDef, Row } from "@tanstack/react-table"

import { Collaborator } from "@/types/projects"
import { Skeleton } from "@/components/ui/skeleton"
import AddressComponent from "@/components/ui-extended/address"

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
]

export const columnsSkeleton: ColumnDef<Collaborator[] | undefined>[] =
  columns.map((column) => {
    return {
      ...column,
      cell: () => <Skeleton className="h-[16px] w-[100px]" />,
    }
  })
