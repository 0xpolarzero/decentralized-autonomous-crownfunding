import { useEffect, useState } from "react"
import { LucideClipboard, LucideClipboardCheck } from "lucide-react"
import useClipboard from "react-use-clipboard"
import { useEnsName } from "wagmi"

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface AddressComponentProps {
  address: `0x${string}`
  tryEns: boolean
  large?: boolean
}

const AddressComponent: React.FC<AddressComponentProps> = ({
  address,
  tryEns,
  large = false,
}) => {
  const {
    data: ensName,
    isError,
    isLoading,
  } = useEnsName({
    address: address,
  })
  const [isCopied, setCopied] = useClipboard(address, {
    successDuration: 2000,
  })

  const renderAddress = (full = false) =>
    full ? address : `${address.slice(0, 4)}...${address.slice(-4)}`

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          {tryEns && !isError && !isLoading && ensName ? (
            ensName
          ) : (
            <>
              <div className="block sm:hidden">{renderAddress()}</div>
              <div className="hidden sm:block md:hidden">
                {renderAddress(large)}
              </div>
              <div className="hidden md:block 2xl:hidden">
                {renderAddress(large)}
              </div>
              <div className="hidden 2xl:block">{address}</div>
            </>
          )}
        </TooltipTrigger>
        <TooltipContent className="flex items-center space-x-2">
          {address}
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
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

export default AddressComponent
