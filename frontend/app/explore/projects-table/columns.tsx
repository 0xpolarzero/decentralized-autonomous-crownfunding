"use client"

import Link from "next/link"
import useGlobalStore from "@/stores/useGlobalStore"
import useCopyToClipboard from "@/utils/copy-to-clipboard"
import { ColumnDef } from "@tanstack/react-table"
import {
  ArrowUpDown,
  LucideArrowDownRight,
  LucideArrowUpRight,
  LucideBanknote,
  LucideCheckCircle2,
  LucideExternalLink,
  LucideInfo,
  LucideShare2,
  LucideXCircle,
  MoreHorizontal,
} from "lucide-react"

import { chainConfig } from "@/config/network"
import { siteConfig } from "@/config/site"
import { Badge } from "@/components/ui/badge"
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
import AddressComponent from "@/components/ui-custom/address"
import CurrencyComponent from "@/components/ui-custom/currency"
import TooltipComponent from "@/components/ui-custom/tooltip"
import { ProjectTable } from "@/app/explore/projects-table/types"

/* -------------------------------------------------------------------------- */
/*                                    name                                    */
/* -------------------------------------------------------------------------- */

const NameCell = ({ row }: { row: any }) => row.getValue("name")

/* -------------------------------------------------------------------------- */
/*                                   status                                   */
/* -------------------------------------------------------------------------- */

const StatusCell = ({ row }: { row: any }) => {
  const status: string = row.getValue("status")
  const lastActivityAt: string = row.original.lastActivityAt
  const timeSinceLastActivity = Date.now() - Date.parse(lastActivityAt)
  const timeSinceLastActivityInDays =
    timeSinceLastActivity / 1000 / 60 / 60 / 24

  if (status)
    return (
      <TooltipComponent
        shownContent={
          <span className="flex items-center space-x-2">
            <LucideCheckCircle2 size={16} color="var(--green)" />{" "}
            <span>Active</span>
          </span>
        }
        tooltipContent={`Last activity ${timeSinceLastActivityInDays.toFixed()} days ago (${lastActivityAt})`}
      />
    )

  return (
    <TooltipComponent
      shownContent={
        <span className="flex items-center space-x-2">
          <LucideXCircle size={16} color="var(--yellow)" />
          <span>Inactive</span>
        </span>
      }
      tooltipContent={`Last activity ${timeSinceLastActivityInDays.toFixed()} days ago (${lastActivityAt})`}
    />
  )
}

/* -------------------------------------------------------------------------- */
/*                                collaborators                               */
/* -------------------------------------------------------------------------- */

const CollaboratorsCell = ({ row }: { row: any }) => {
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
/*                                 totalRaised                                */
/* -------------------------------------------------------------------------- */

const TotalRaisedCell = ({ row }: { row: any }) => {
  const totalRaised: number = row.getValue("totalRaised")
  return <CurrencyComponent amount={Number(totalRaised)} currency="matic" />
}

/* -------------------------------------------------------------------------- */
/*                                    links                                   */
/* -------------------------------------------------------------------------- */

const LinksCell = ({ row }: { row: any }) => {
  const links: string[] = row.getValue("links")
  return (
    <div className="space-y-2">
      {links.map((link, i) => {
        return (
          <div key={i} className="whitespace-pre-line">
            <a href={link} target="_blank" rel="noopener noreferrer">
              {link.replace("https://", "")}
            </a>
          </div>
        )
      })}
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*                                    tags                                    */
/* -------------------------------------------------------------------------- */

const TagsCell = ({ row }: { row: any }) => {
  const tags: string[] = row.getValue("tags")
  return (
    <div className="flex flex-wrap justify-between gap-2">
      {tags.map((tag, i) => {
        return (
          <Badge key={i} variant="outline">
            {tag}
          </Badge>
        )
      })}
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*                                   actions                                  */
/* -------------------------------------------------------------------------- */

const ActionsCell = ({ row }: { row: any }) => {
  const networkInfo =
    chainConfig.networks[
      row.original.network as keyof typeof chainConfig.networks
    ]
  const copyToClipboard = useCopyToClipboard()
  const hasContributorAccount = useGlobalStore(
    (state) => state.hasContributorAccount
  )

  return (
    <DropdownMenu>
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
        {hasContributorAccount ? (
          <DropdownMenuItem>
            <LucideBanknote size={16} className="mr-2" color="var(--green)" />
            <span style={{ color: "var(--green)" }}>Contribute</span>
          </DropdownMenuItem>
        ) : (
          <TooltipComponent
            shownContent={
              <DropdownMenuItem disabled>
                <LucideBanknote
                  size={16}
                  className="mr-2"
                  color="var(--green)"
                />
                <span style={{ color: "var(--green)" }}>Contribute</span>
              </DropdownMenuItem>
            }
            tooltipContent={
              <>
                <p>You need to connect your wallet to contribute.</p>
                <p>
                  Make sure you are on a supported chain and you have a
                  contributor account.
                </p>
              </>
            }
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
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <StatusCell row={row} />,
  },
  {
    accessorKey: "collaborators",
    header: "Collaborators",
    cell: ({ row }) => <CollaboratorsCell row={row} />,
  },
  {
    accessorKey: "totalRaised",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => {
            column.toggleSorting(column.getIsSorted() === "asc")
            console.log(column.getIsSorted())
          }}
        >
          Raised
          {column.getIsSorted() === "asc" ? (
            <LucideArrowUpRight className="ml-2 h-4 w-4" />
          ) : column.getIsSorted() === "desc" ? (
            <LucideArrowDownRight className="ml-2 h-4 w-4" />
          ) : (
            <ArrowUpDown className="ml-2 h-4 w-4" />
          )}
        </Button>
      )
    },
    cell: ({ row }) => <TotalRaisedCell row={row} />,
  },
  {
    accessorKey: "links",
    header: "Links",
    cell: ({ row }) => <LinksCell row={row} />,
  },
  {
    accessorKey: "tags",
    header: "Categories",
    cell: ({ row }) => <TagsCell row={row} />,
  },

  {
    // accessorKey: "actions",
    // header: "Actions",
    id: "actions",
    cell: ({ row }) => <ActionsCell row={row} />,
  },
]

export const columnsSkeleton: ColumnDef<ProjectTable>[] = columns.map(
  (column) => {
    return {
      ...column,
      cell: ({ row }) => <Skeleton className="h-[16px] w-[100px]" />,
    }
  }
)
