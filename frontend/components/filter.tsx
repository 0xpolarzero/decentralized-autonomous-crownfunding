import { HeaderContext } from "@tanstack/react-table"
import {
  ArrowUpDown,
  LucideArrowDownRight,
  LucideArrowUpRight,
} from "lucide-react"

import { Contribution } from "@/types/contributions"
import { Button } from "@/components/ui/button"
import TooltipComponent from "@/components/ui-custom/tooltip"

interface FilterComponentProps {
  column: HeaderContext<Contribution, any>
  hint: string
  ascending: string
  descending: string
}

const FilterComponent: React.FC<FilterComponentProps> = ({
  column,
  hint,
  ascending,
  descending,
}) => {
  return (
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
            <LucideArrowUpRight className="ml-2 h-4 w-4" />
          ) : column.getIsSorted() === "desc" ? (
            <LucideArrowDownRight className="ml-2 h-4 w-4" />
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
  )
}

export default FilterComponent
