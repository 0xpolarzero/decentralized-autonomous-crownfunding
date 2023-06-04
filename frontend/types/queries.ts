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
  contributors: { id: string }[]
  totalRaised: number
}

export interface GetProjectsData {
  projects: Project[]
}

export interface GetProjectsVariables {
  pageNumber: number
  amountPerPage: number
}
