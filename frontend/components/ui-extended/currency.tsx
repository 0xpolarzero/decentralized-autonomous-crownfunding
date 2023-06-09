import React from "react"
import Image from "next/image"
import useGlobalStore from "@/stores/useGlobalStore"
import { formatUnits } from "viem"

import { currencies, networkConfig } from "@/config/network"
import { cn } from "@/lib/utils"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface CurrencyComponentProps {
  amount: number
  currency: "native" | "link"
  className?: string
}

const CurrencyComponent: React.FC<CurrencyComponentProps> = ({
  amount,
  currency,
  className,
}) => {
  const currentNetwork = useGlobalStore((state) => state.currentNetwork)
  const actualCurrency =
    currency === "native" ? currentNetwork?.currency.symbol : currency

  const formatAmount = (value: number) =>
    value
      ? Number(
          formatUnits(BigInt(value), currentNetwork?.currency.decimals || 18)
        ).toFixed(4)
      : "0"

  const getCurrencyIcon = () => {
    if (currency === "native") {
      return (
        <Image src={currencies.matic.icon} alt="matic" width={16} height={16} />
      )
    } else if (currency === "link") {
      return (
        <Image src={currencies.link.icon} alt="link" width={16} height={16} />
      )
    } else {
      return (
        <Image src={currencies.eth.icon} alt="eth" width={16} height={16} />
      )
    }
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <div className={cn("flex items-center gap-2", className || "")}>
            {getCurrencyIcon()}
            <span>{Number(formatAmount(amount))}</span>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          {formatUnits(BigInt(amount), currentNetwork?.currency.decimals || 18)}{" "}
          {currency === "native"
            ? actualCurrency
            : networkConfig.defaultCurrency.symbol}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

export default CurrencyComponent
