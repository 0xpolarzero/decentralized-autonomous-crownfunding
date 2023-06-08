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
  project: Project
  projectStatus: true | false
  amountStored: number
  amountDistributed: number
  startedAt: string
  endsAt: string
  totalDistributed: number
  totalStored: number
}
