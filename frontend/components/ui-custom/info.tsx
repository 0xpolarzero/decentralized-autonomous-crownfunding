import React from "react"
import { LucideInfo } from "lucide-react"

import TooltipComponent from "./tooltip"

interface InfoComponentProps {
  content: React.ReactNode
}

const InfoComponent: React.FC<InfoComponentProps> = ({ content }) => {
  return (
    <TooltipComponent
      shownContent={<LucideInfo size={16} />}
      tooltipContent={content}
    />
  )
}

export default InfoComponent
