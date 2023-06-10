import { useEffect, useState } from "react"
import Link from "next/link"
import useGlobalStore from "@/stores/useGlobalStore"
import { fetchEnsName } from "@wagmi/core"
import { LucideClipboard, LucideClipboardCheck } from "lucide-react"
import useClipboard from "react-use-clipboard"

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface AddressComponentProps {
  address: `0x${string}`
  tryEns?: boolean
  large?: boolean
}

const AddressComponent: React.FC<AddressComponentProps> = ({
  address,
  tryEns = false,
  large = false,
}) => {
  const currentNetwork = useGlobalStore((state) => state.currentNetwork)

  const [isCopied, setCopied] = useClipboard(address, {
    successDuration: 2000,
  })

  const [ensName, setEnsName] = useState<string | null>(null)

  const renderAddress = (full = false) =>
    full ? address : `${address?.slice(0, 4)}...${address?.slice(-4)}`

  useEffect(() => {
    if (tryEns && currentNetwork?.ensSupported)
      fetchEnsName({ address }).then((name) => {
        setEnsName(name)
      })
  }, [address, tryEns])

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          {ensName ? (
            ensName
          ) : (
            <Link
              href={`${currentNetwork?.blockExplorer.url}address/${address}`}
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              <div className="block sm:hidden">{renderAddress()}</div>
              <div className="hidden sm:block md:hidden">
                {renderAddress(large)}
              </div>
              <div className="hidden md:block 2xl:hidden">
                {renderAddress(large)}
              </div>
              <div className="hidden 2xl:block">{address}</div>
            </Link>
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
