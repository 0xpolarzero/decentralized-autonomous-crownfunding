import { Project } from "@/types/projects"

export default function formatData(data: Project[]) {
  return data.map((project) => {
    const {
      id,
      name,
      description,
      links,
      tags,
      createdAt,
      lastActivityAt,
      projectContract,
      initiator,
      collaborators,
      shares,
      contributors,
      totalRaised,
      network,
      blockExplorer,
    } = project
    return {
      // Direct display
      id,
      name,
      // Active only if timestamp < 30 days ago
      status:
        new Date(Number(lastActivityAt) * 1000) >
        new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          ? true
          : false,
      collaborators,
      totalRaised: Number(totalRaised),
      links,
      tags,
      // Indirect display (popover, modal, etc.)
      description,
      createdAt: Number(createdAt) * 1000,
      lastActivityAt: Number(lastActivityAt) * 1000,
      projectContract,
      initiator,
      shares: shares.map((share) => Number(share)),
      contributors,
      network,
      blockExplorer,
    }
  })
}
