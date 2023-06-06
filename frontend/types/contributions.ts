import { ContributorAccount } from "./contributor-account"
import { Project } from "./projects"

export interface Contribution {
  id: string
  account: ContributorAccount
  project: Project
  amountStored: number
  amountDistributed: number
  startedAt: string
  endsAt: string
}

export interface ContributionTable {
  id: string
  accountContract: string
  owner: string
  amountStored: number
  amountDistributed: number
  startedAt: string
  endsAt: string
  totalRaised: number
  totalStored: number
}
