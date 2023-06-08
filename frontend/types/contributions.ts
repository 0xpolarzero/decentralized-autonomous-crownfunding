import { ContributorAccount } from "./contributor-account"
import { Project } from "./projects"

export interface Contribution {
  id: string
  account: ContributorAccount
  project: Project
  amountStored: string
  amountDistributed: string
  startedAt: string
  endsAt: string
}

export interface ContributionTable {
  id: string
  project: Project
  projectStatus: true | false
  amountStored: number
  amountDistributed: number
  startedAt: number
  endsAt: number
  totalDistributed: number
  totalStored: number
  lastContributionsTransferedAt: number
  paymentInterval: number | null
}

export interface ContributionToSend {
  id: string
  project: Project
  amount: number
  index: number
}
