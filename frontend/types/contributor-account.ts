import { Contribution } from "./contributions"

export interface ContributorAccount {
  id: string
  owner: string
  accountContract: string
  createdAt: string
  contributions: Contribution[]
  contributionsCount?: string
  totalContributed: string
  lastContributionsTransferedAt: string
}
