import React from "react"
import useGlobalStore from "@/stores/useGlobalStore"
import { Row } from "@tanstack/react-table"

import { Button } from "@/components/ui/button"
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { ProjectTable } from "@/app/explore/projects-table/types"

interface ContributeDialogComponentProps {
  data: Row<ProjectTable>
}

const ContributeDialogComponent: React.FC<ContributeDialogComponentProps> = ({
  data,
}) => {
  const currentNetwork = useGlobalStore((state) => state.currentNetwork)

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Contribute to {data.original.name}</DialogTitle>
        <DialogDescription>
          <p className="mt-2">
            This will{" "}
            <b>
              store the desired amount securely in your contributor account
              contract
            </b>
            , and <b>distribute it</b> evenly to the project&apos;s contributors
            over the specified period.
          </p>
          <p>
            You will be able to trigger payments manually and/or fund a
            Chainlink Automation with LINK that will trigger payments
            automatically.
          </p>
          <Separator className="my-4" />
          Amount
          <Input type="number" placeholder="0.0" />
        </DialogDescription>
      </DialogHeader>
      <DialogFooter>
        <Button type="submit">Confirm</Button>
      </DialogFooter>
    </DialogContent>
  )
}

export default ContributeDialogComponent
