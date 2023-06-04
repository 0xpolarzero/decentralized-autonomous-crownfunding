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
}

const AddressComponent: React.FC<AddressComponentProps> = ({
  address,
  tryEns,
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

  const [displayAddress, setDisplayAddress] = useState("")

  useEffect(() => {
    if (tryEns && !isError && !isLoading && ensName) {
      setDisplayAddress(ensName)
    } else {
      // slice the address to keep the first 5 letters and last 4 letters
      setDisplayAddress(`${address.slice(0, 5)}...${address.slice(-4)}`)
    }
  }, [address, tryEns, isError, isLoading, ensName])

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>{displayAddress}</TooltipTrigger>
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
