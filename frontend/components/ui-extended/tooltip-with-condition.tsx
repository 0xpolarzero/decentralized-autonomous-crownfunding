import React from "react"

import TooltipComponent from "./tooltip"

interface TooltipWithConditionProps {
  shownContent: React.ReactNode
  tooltipContent: React.ReactNode
  condition: boolean
}

const TooltipWithConditionComponent: React.FC<TooltipWithConditionProps> = ({
  shownContent,
  tooltipContent,
  condition,
}) => {
  if (condition)
    return (
      <TooltipComponent
        shownContent={shownContent}
        tooltipContent={tooltipContent}
      />
    )

  return <>{shownContent}</>
}

export default TooltipWithConditionComponent
