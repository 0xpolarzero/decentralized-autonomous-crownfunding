import { ContributorAccount } from "./contributor-account"
import { Project } from "./projects"

export interface Contribution {
  id: string
  account: ContributorAccount
  project: Project
  amountStored: number
  amountDistributed: number
  startedAt: number
  endsAt: number
}
