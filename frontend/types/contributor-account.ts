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
  executeGas: number
  checkData: string
  balance: bigint
  admin: string
  maxValidBlocknumber: bigint
  lastPerformBlockNumber: number
  amountSpent: bigint
  paused: boolean
  offchainConfig: string
  canceled: boolean
}
