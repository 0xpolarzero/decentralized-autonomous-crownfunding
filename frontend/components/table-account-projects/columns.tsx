"use client"

import { use, useEffect, useState } from "react"
import Link from "next/link"
import useGlobalStore from "@/stores/useGlobalStore"
import { ColumnDef, Row } from "@tanstack/react-table"
import { waitForTransaction } from "@wagmi/core"
import {
  ArrowDown01,
  ArrowDown10,
  ArrowUpDown,
  Loader2,
  LucideActivity,
  LucideAlertCircle,
  LucideCheckCircle2,
  LucideExternalLink,
  LucideInfo,
  LucideShare2,
  LucideWallet,
  MoreHorizontal,
} from "lucide-react"
import { TransactionReceipt } from "viem"
import { useContractRead, useContractWrite } from "wagmi"

import { ProjectTable } from "@/types/projects"
import { DACAggregatorAbi } from "@/config/constants/abis/DACAggregator"
import { DACProjectAbi } from "@/config/constants/abis/DACProject"
import { networkConfig, networkMapping } from "@/config/network"
import { siteConfig } from "@/config/site"
import useCopyToClipboard from "@/hooks/copy-to-clipboard"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/components/ui/use-toast"
import AddressComponent from "@/components/ui-extended/address"
import CurrencyComponent from "@/components/ui-extended/currency"
import DurationComponent from "@/components/ui-extended/duration"
import InfoComponent from "@/components/ui-extended/info"
import TooltipComponent from "@/components/ui-extended/tooltip"

type CellProps = {
  row: Row<ProjectTable>
}

/* -------------------------------------------------------------------------- */
/*                                    name                                    */
/* -------------------------------------------------------------------------- */

const NameCell: React.FC<CellProps> = ({ row }: { row: Row<ProjectTable> }) =>
  row.getValue("name")

/* -------------------------------------------------------------------------- */
/*                                collaborators                               */
/* -------------------------------------------------------------------------- */

const CollaboratorsCell: React.FC<CellProps> = ({ row }) => {
  const addresses: `0x${string}`[] = row.getValue("collaborators")
  return (
    <div className="space-y-2">
      {addresses.map((collaborator, i) => {
        return (
          <div key={i} className="whitespace-pre-line">
            <AddressComponent address={collaborator} tryEns />
          </div>
        )
      })}
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*                                   status                                   */
/* -------------------------------------------------------------------------- */

const StatusCell: React.FC<CellProps> = ({ row }) => {
  const dateWhenInactive = new Date(
    row.original.lastActivityAt + 1000 * 60 * 60 * 24 * 30
  )

  const daysLeft = Math.floor(
    (dateWhenInactive.getTime() - new Date().getTime()) / 1000 / 60 / 60 / 24
  )

  return (
    <TooltipComponent
      shownContent={
        <div className="flex flex-col">
          <span className="flex items-center gap-2">
            {daysLeft > 14 ? (
              <LucideCheckCircle2 size={16} color="var(--green)" />
            ) : daysLeft > 7 ? (
              <LucideAlertCircle size={16} color="var(--yellow)" />
            ) : (
              <LucideAlertCircle size={16} color="var(--red)" />
            )}
            <DurationComponent
              startTimestamp={new Date().getTime()}
              endTimestamp={dateWhenInactive.getTime()}
            />
          </span>
          <p className="whitespace-nowrap text-sm text-muted-foreground">
            before inactivity
          </p>
        </div>
      }
      tooltipContent={
        <>
          Will be inactive on {dateWhenInactive.toLocaleDateString()} (30 days
          after last activity).
        </>
      }
    />
  )
}

/* -------------------------------------------------------------------------- */
/*                                 totalRaised                                */
/* -------------------------------------------------------------------------- */

const TotalRaisedCell: React.FC<CellProps> = ({ row }) => {
  const totalRaised: number = row.getValue("totalRaised")
  return <CurrencyComponent amount={Number(totalRaised)} currency="native" />
}

/* -------------------------------------------------------------------------- */
/*                                    share                                   */
/* -------------------------------------------------------------------------- */

const ShareCell: React.FC<CellProps> = ({ row }) => {
  const totalRaised = Number(row.original.totalRaised)
  const sharePercentage = Number(
    row.original.shares[
      row.original.collaborators
        .map((address) => address.toLowerCase())
        .indexOf(row.original.userAddress?.toLowerCase() || "")
    ]
  )
  const shareAmount = (totalRaised * sharePercentage) / 100

  return (
    <div className="flex flex-col gap-2">
      <CurrencyComponent amount={shareAmount} currency="native" />
      <span className="text-muted-foreground">
        {Number(sharePercentage.toFixed(2))}%
      </span>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*                                withdrawable                                */
/* -------------------------------------------------------------------------- */

const WithdrawableCell: React.FC<CellProps> = ({ row }) => {
  const { shouldRefresh, resetRefresh } = useGlobalStore((state) => ({
    shouldRefresh: state.shouldRefresh,
    resetRefresh: state.resetRefresh,
  }))

  const { data, isError, isLoading, refetch }: any = useContractRead({
    address: row.original.projectContract as `0x${string}`,
    abi: DACProjectAbi,
    functionName: "getCollaborator",
    args: [row.original.userAddress],
  })

  const [withdrawable, setWithdrawable] = useState<number>(0)
  const [withdrawn, setWithdrawn] = useState<number>(0)

  const totalRaised = Number(row.original.totalRaised)

  useEffect(() => {
    if (data) {
      setWithdrawable(Number(data.amountAvailable))
      setWithdrawn(
        (totalRaised * Number(data.share)) / 100 - Number(data.amountAvailable)
      )
    }
  }, [data, totalRaised])

  useEffect(() => {
    if (shouldRefresh) {
      refetch()
      resetRefresh()
    }
  }, [shouldRefresh, refetch, resetRefresh])

  if (isLoading) return <Skeleton className="h-6 w-20" />

  if (isError) return <span style={{ color: "var(--yellow)" }}>Error</span>

  return (
    <div className="flex flex-col gap-2">
      <CurrencyComponent amount={withdrawable} currency="native" />
      <span className="text-muted-foreground">
        <span className="flex items-center gap-4 whitespace-nowrap">
          <CurrencyComponent amount={withdrawn} currency="native" /> already
          withdrawn
        </span>
      </span>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*                                   actions                                  */
/* -------------------------------------------------------------------------- */

const ActionsCell: React.FC<CellProps> = ({ row }) => {
  const { currentNetwork, refresh } = useGlobalStore((state) => ({
    currentNetwork: state.currentNetwork,
    refresh: state.refresh,
  }))

  const networkInfo =
    currentNetwork || networkConfig.networks[networkConfig.defaultNetwork]

  const [isPinging, setIsPinging] = useState<boolean>(false)
  const [isWithdrawing, setIsWithdrawing] = useState<boolean>(false)

  const { toast } = useToast()

  const isStillActive = (): boolean =>
    new Date().getTime() - row.original.lastActivityAt <
    1000 * 60 * 60 * 24 * 30 // 30 days

  const copyToClipboard = useCopyToClipboard()

  const { data: collaboratorData }: any = useContractRead({
    address: row.original.projectContract as `0x${string}`,
    abi: DACProjectAbi,
    functionName: "getCollaborator",
    args: [row.original.userAddress],
  })

  const { write: pingProject } = useContractWrite({
    address: networkMapping[networkInfo.chainId]["DACAggregator"][0],
    abi: DACAggregatorAbi,
    functionName: "pingProject",
    args: [row.original.projectContract],

    onSuccess: async (tx) => {
      setIsPinging(true)

      const receipt: TransactionReceipt = await waitForTransaction({
        hash: tx.hash,
        confirmations: networkInfo.confirmations || 3,
      })
      console.log(receipt)

      if (receipt.status === "success") {
        toast({
          title: "Project pinged",
          description: (
            <>
              <p>Your project will stay active for another 30 days.</p>
              <p>
                <Link
                  href={`${networkInfo.blockExplorer.url}tx/${tx.hash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline"
                >
                  See on block explorer
                </Link>
              </p>
            </>
          ),
        })
      } else {
        toast({
          variant: "destructive",
          title: "Something went wrong",
          description: "Please try again.",
        })
      }

      setIsPinging(false)
    },
    onError: (err) => {
      toast({
        variant: "destructive",
        title: "Something went wrong",
        description: "Please try again.",
      })
      console.error(err)
    },
  })

  const { write: withdrawShare } = useContractWrite({
    address: row.original.projectContract as `0x${string}`,
    abi: DACProjectAbi,
    functionName: "withdrawShare",
    args: [collaboratorData?.amountAvailable],

    onSuccess: async (tx) => {
      setIsWithdrawing(true)

      const receipt: TransactionReceipt = await waitForTransaction({
        hash: tx.hash,
        confirmations: networkInfo.confirmations || 3,
      })
      console.log(receipt)

      if (receipt.status === "success") {
        refresh()

        toast({
          title: "Share withdrawn",
          description: (
            <>
              <p>
                You&apos;ve successfully withdrawn{" "}
                <CurrencyComponent
                  amount={Number(collaboratorData.amountAvailable)}
                  currency="native"
                />
              </p>
              <p>
                <Link
                  href={`${networkInfo.blockExplorer.url}tx/${tx.hash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline"
                >
                  See on block explorer
                </Link>
              </p>
            </>
          ),
        })
      } else {
        toast({
          variant: "destructive",
          title: "Something went wrong",
          description: "Please try again.",
        })
      }

      setIsWithdrawing(false)
    },
    onError: (err) => {
      toast({
        variant: "destructive",
        title: "Something went wrong",
        description: "Please try again.",
      })
      console.error(err)
    },
  })

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <Link href={`/project?address=${row.original.projectContract}`}>
          <DropdownMenuItem>
            <LucideInfo size={16} className="mr-2" />
            Show project&apos;s page
          </DropdownMenuItem>
        </Link>
        <Link href={row.original.blockExplorer} target="_blank">
          <DropdownMenuItem>
            <LucideExternalLink size={16} className="mr-2" />
            Show on {networkInfo.blockExplorer.name}
          </DropdownMenuItem>
        </Link>
        <DropdownMenuItem
          onClick={() =>
            copyToClipboard(
              `${siteConfig.url}/project?address=${row.original.projectContract}`
            )
          }
        >
          <LucideShare2 size={16} className="mr-2" />
          Share this campain
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {isStillActive() ? (
          <DropdownMenuItem
            onSelect={(e) => {
              e.preventDefault()
              pingProject()
            }}
          >
            {isPinging ? (
              <Loader2
                className="mr-2 h-4 w-4 animate-spin"
                size={16}
                color="var(--yellow)"
              />
            ) : (
              <LucideActivity size={16} className="mr-2" color="var(--green)" />
            )}
            <span style={{ color: "var(--green)" }}>
              {isPinging ? "Pinging..." : "Ping"}
            </span>
          </DropdownMenuItem>
        ) : (
          <TooltipComponent
            shownContent={
              <DropdownMenuItem disabled>
                <LucideActivity
                  size={16}
                  className="mr-2"
                  color="var(--green)"
                />
                <span style={{ color: "var(--green)" }}>Ping</span>
              </DropdownMenuItem>
            }
            tooltipContent="This project is no longer active."
          />
        )}
        {Number(row.original.totalRaised) > 0 ? (
          <DropdownMenuItem
            onSelect={(e) => {
              e.preventDefault()
              withdrawShare()
            }}
          >
            {isWithdrawing ? (
              <Loader2
                className="mr-2 h-4 w-4 animate-spin"
                size={16}
                color="var(--yellow)"
              />
            ) : (
              <LucideWallet size={16} className="mr-2" color="var(--green)" />
            )}
            <span style={{ color: "var(--green)" }}>
              {isWithdrawing ? "Withdrawing share..." : "Withdraw share"}
            </span>
          </DropdownMenuItem>
        ) : (
          <TooltipComponent
            shownContent={
              <DropdownMenuItem disabled>
                <LucideWallet size={16} className="mr-2" color="var(--green)" />
                <span style={{ color: "var(--green)" }}>Withdraw share</span>
              </DropdownMenuItem>
            }
            tooltipContent="This project has not raised any funds yet."
          />
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

/* -------------------------------------------------------------------------- */
/*                                   COLUMNS                                  */
/* -------------------------------------------------------------------------- */

export const columns: ColumnDef<ProjectTable>[] = [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => <NameCell row={row} />,
  },
  {
    accessorKey: "collaborators",
    header: "Collaborators",
    cell: ({ row }) => <CollaboratorsCell row={row} />,
  },
  {
    accessorKey: "status",
    header: () => {
      return (
        <div className="flex items-center gap-2">
          <span>Status</span>
          <InfoComponent
            content={
              <>
                <p>The time left before the project is considered inactive.</p>
                <p>
                  A collaborator needs to manifest themselves to keep the
                  project active for 30 more days.
                </p>
              </>
            }
          />
        </div>
      )
    },
    cell: ({ row }) => <StatusCell row={row} />,
  },
  {
    accessorKey: "totalRaised",
    header: ({ column }) => {
      return (
        <div className="flex items-center justify-between gap-2">
          <span>Raised</span>
          <TooltipComponent
            shownContent={
              <Button
                variant="ghost"
                className="pl-1 pr-3"
                onClick={() => {
                  column.toggleSorting(column.getIsSorted() === "asc")
                }}
              >
                {column.getIsSorted() === "asc" ? (
                  <ArrowDown01 className="ml-2 h-4 w-4" />
                ) : column.getIsSorted() === "desc" ? (
                  <ArrowDown10 className="ml-2 h-4 w-4" />
                ) : (
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                )}
              </Button>
            }
            tooltipContent={
              column.getIsSorted() === "asc"
                ? "Showing lowest first"
                : column.getIsSorted() === "desc"
                ? "Showing highest first"
                : "Sort by amount raised"
            }
          />
        </div>
      )
    },
    cell: ({ row }) => <TotalRaisedCell row={row} />,
  },
  {
    accessorKey: "share",
    header: "Your share",
    cell: ({ row }) => <ShareCell row={row} />,
  },
  {
    accessorKey: "withdrawable",
    header: "Withdrawable",
    cell: ({ row }) => <WithdrawableCell row={row} />,
  },

  {
    id: "actions",
    cell: ({ row }) => <ActionsCell row={row} />,
  },
]

export const columnsSkeleton: ColumnDef<ProjectTable>[] = columns.map(
  (column) => {
    return {
      ...column,
      cell: () => <Skeleton className="h-[16px] w-[100px]" />,
    }
  }
)
