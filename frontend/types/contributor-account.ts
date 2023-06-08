import { Contribution } from "./contributions"

export interface ContributorAccount {
  id: string
  owner: string
  accountContract: string
  createdAt: number
  contributions: Contribution[]
  contributionsCount: number
  totalContributed: number
  lastContributionsTransferedAt: number
}
