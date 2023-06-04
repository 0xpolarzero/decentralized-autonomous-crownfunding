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
}
