import React from "react"

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface TooltipComponentProps {
  shownContent: React.ReactNode
  tooltipContent: React.ReactNode
}

const TooltipComponent: React.FC<TooltipComponentProps> = ({
  shownContent,
  tooltipContent,
}) => {
  return (
    <Tooltip>
      <TooltipTrigger>{shownContent}</TooltipTrigger>
      <TooltipContent>{tooltipContent}</TooltipContent>
    </Tooltip>
  )
}

export default TooltipComponent
