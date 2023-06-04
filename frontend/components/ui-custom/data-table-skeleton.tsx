import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface DataTableSkeletonProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  rowCount: number
}

export function DataTableSkeleton<TData, TValue>({
  columns,
  rowCount,
}: DataTableSkeletonProps<TData, TValue>) {
  const table = useReactTable({
    data: Array(rowCount).fill({}), // Use an array of empty objects as the data
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id}>
                  {header.isPlaceholder ? (
                    <div className="h-4 w-20 animate-pulse rounded-md bg-gray-200" />
                  ) : (
                    flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )
                  )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length
            ? table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            : Array(rowCount)
                .fill(0)
                .map((_, index) => (
                  <TableRow key={index}>
                    {columns.map((_, columnIndex) => (
                      <TableCell key={columnIndex}>
                        <div className="h-4 w-20 animate-pulse rounded-md bg-gray-200" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
        </TableBody>
      </Table>
    </div>
  )
}
