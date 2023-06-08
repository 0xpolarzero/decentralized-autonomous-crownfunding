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

export interface UpkeepInfo {
  target: string
  executeGas: string
  checkData: string
  balance: string
  admin: string
  maxValidBlocknumber: string
  lastPerformBlockNumber: string
  amountSpent: string
  paused: boolean
  offchainConfig: string
}
