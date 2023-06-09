import { useEffect, useState } from "react"
import Link from "next/link"
import useGlobalStore from "@/stores/useGlobalStore"
import {
  LucideCheckCircle2,
  LucideClipboard,
  LucideClipboardCheck,
  LucideEye,
  LucideXCircle,
} from "lucide-react"
import useClipboard from "react-use-clipboard"

import { UpkeepInfo } from "@/types/contributor-account"
import { networkConfig } from "@/config/network"
import useCopyToClipboard from "@/hooks/copy-to-clipboard"

import CurrencyComponent from "../ui-extended/currency"
import { Button } from "../ui/button"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "../ui/hover-card"

interface UpkeepInformationComponentProps {
  upkeep: UpkeepInfo | null
  id: string
}

const UpkeepInformationComponent: React.FC<UpkeepInformationComponentProps> = ({
  upkeep,
  id,
}) => {
  const currentNetwork = useGlobalStore((state) => state.currentNetwork)
  const networkInfo =
    currentNetwork || networkConfig.networks[networkConfig.defaultNetwork]

  const [isCopied, setCopied] = useClipboard(id, {
    successDuration: 2000,
  })

  return (
    <HoverCard>
      <HoverCardTrigger asChild className="flex">
        <Button className="flex items-center gap-2 whitespace-nowrap">
          <LucideEye size={16} /> Your Upkeep information
        </Button>
      </HoverCardTrigger>
      <HoverCardContent className="w-160">
        <div className="flex justify-between space-x-4">
          <div className="space-y-3">
            <div className="space-y-1">
              <h4 className="text-sm font-semibold">Id</h4>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                {id ? `${id.slice(0, 6)}...${id.slice(-4)}` : "N/A"}
                <button
                  className="ml-2 text-gray-500 hover:text-gray-700"
                  onClick={setCopied}
                >
                  {isCopied ? (
                    <LucideClipboardCheck size={16} />
                  ) : (
                    <LucideClipboard size={16} />
                  )}
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <h4 className="text-sm font-semibold">Status</h4>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                {upkeep?.canceled ? (
                  <div className="flex items-center space-x-2">
                    <LucideXCircle size={16} color="var(--red)" />
                    <span>Canceled</span>
                  </div>
                ) : upkeep?.paused ? (
                  <div className="flex items-center space-x-2">
                    <LucideXCircle size={16} color="var(--yellow)" />
                    <span>Paused</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <LucideCheckCircle2 size={16} color="var(--green)" />
                    <span>Active</span>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-1">
              <h4 className="text-sm font-semibold">Balance</h4>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <CurrencyComponent
                  amount={Number(upkeep?.balance)}
                  currency="link"
                />{" "}
                LINK
              </div>
            </div>

            <div className="space-y-1">
              <h4 className="text-sm font-semibold">Spent</h4>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <CurrencyComponent
                  amount={Number(upkeep?.amountSpent)}
                  currency="link"
                />{" "}
                LINK
              </div>
            </div>

            <div className="flex items-center pt-2">
              <Link
                className="text-xs text-muted-foreground underline"
                href={`https://automation.chain.link/${networkInfo.name.toLowerCase()}/${id}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                See on Chainlink Automation UI
              </Link>
            </div>
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  )
}

export default UpkeepInformationComponent
