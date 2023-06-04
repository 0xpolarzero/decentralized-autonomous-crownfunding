import React from "react"
import Image from "next/image"
import EthIcon from "@/assets/icons/eth.svg"
import LinkIcon from "@/assets/icons/link.svg"
import MaticIcon from "@/assets/icons/matic.svg"

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface CurrencyComponentProps {
  amount: number
  currency: "matic" | "link" | "eth"
}

const CurrencyComponent: React.FC<CurrencyComponentProps> = ({
  amount,
  currency,
}) => {
  const formatAmount = (value: number) =>
    value ? (currency === "matic" ? value.toFixed(2) : value.toFixed(4)) : "0"

  const getCurrencyIcon = () => {
    if (currency === "matic") {
      return <Image src={MaticIcon} alt="matic" width={16} height={16} />
    } else if (currency === "link") {
      return <Image src={LinkIcon} alt="link" width={16} height={16} />
    } else if (currency === "eth") {
      return <Image src={EthIcon} alt="eth" width={16} height={16} />
    }

    return null
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <div className="flex items-center space-x-2">
            {getCurrencyIcon()}
            <span>{formatAmount(amount)}</span>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          {amount} {currency.toUpperCase()}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

export default CurrencyComponent
