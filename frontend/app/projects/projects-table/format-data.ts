import { Project } from "@/types/queries"

export default function formatData(data: Project[]) {
  return data.map((project) => {
    const {
      id,
      name,
      description,
      createdAt,
      lastActivityAt,
      projectContract,
      initiator,
      collaborators,
      shares,
      contributors,
      totalRaised,
    } = project
    return {
      // Direct display
      id,
      name,
      // Active only if timestamp < 30 days ago
      status:
        new Date(lastActivityAt * 1000) >
        new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          ? "Active"
          : "Inactive",
      collaborators,
      totalRaised,
      // Indirect display (popover, modal, etc.)
      //   description,
      //     createdAt: new Date(createdAt * 1000).toLocaleDateString(),
      //   lastActivityAt: new Date(lastActivityAt * 1000).toLocaleDateString(),
      //   projectContract,
      //   initiator,
      //   shares,
      //   contributors,
    }
  })
}
