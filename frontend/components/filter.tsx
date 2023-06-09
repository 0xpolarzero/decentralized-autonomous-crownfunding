import {
  ArrowUpDown,
  LucideArrowDownRight,
  LucideArrowUpRight,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import TooltipComponent from "@/components/ui-extended/tooltip"

interface FilterComponentProps {
  column: any
}

const FilterComponent: React.FC<FilterComponentProps> = ({ column }) => {
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
