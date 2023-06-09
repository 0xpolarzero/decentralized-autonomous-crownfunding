import React from "react"
import { LucideAlertCircle, LucideInfo, LucideXCircle } from "lucide-react"

import TooltipComponent from "@/components/ui-extended/tooltip"

interface InfoComponentProps {
  content: React.ReactNode
  type?: "info" | "warning" | "error"
}

const InfoComponent: React.FC<InfoComponentProps> = ({
  content,
  type = "info",
}) => {
  return (
    <TooltipComponent
      shownContent={
        type === "warning" ? (
          <LucideAlertCircle size={16} color="var(--yellow)" />
        ) : type === "error" ? (
          <LucideXCircle size={16} color="var(--red)" />
        ) : (
          <LucideInfo size={16} />
        )
      }
      tooltipContent={content}
    />
  )
}

export default InfoComponent
