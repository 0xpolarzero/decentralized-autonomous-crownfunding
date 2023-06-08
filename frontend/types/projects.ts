import { Contribution } from "./contributions"

export interface Project {
  id: string
  name: string
  description: string
  links: string[]
  tags: string[]
  createdAt: number
  lastActivityAt: number
  projectContract: string
  initiator: string
  collaborators: string[]
  shares: number[]
  contributors?: Contribution[]
  totalRaised: number
  // We add these fields to the Project type after the query
  network: string
  blockExplorer: string
}

export interface GetProjectsData {
  projects: Project[]
}

export interface GetProjectsVariables {
  pageNumber: number
  amountPerPage: number
}

export type ProjectTable = {
  id: string
  name: string
  status: true | false
  collaborators: string[]
  totalRaised: string
  links: string[]
  tags: string[]
  // Indirect display (popover, modal, etc.)
  description: string
  createdAt: string
  lastActivityAt: string
  projectContract: string
  initiator: string
  shares: string
  contributors: string
  network: string
  blockExplorer: string
  userAddress?: string
  // For projects page
  onPingProject?: (projectContract: string) => void
  onWithdrawShare?: (projectContract: string) => void
}

export type Collaborator = {
  id: string
  address: string
  share: number
}
