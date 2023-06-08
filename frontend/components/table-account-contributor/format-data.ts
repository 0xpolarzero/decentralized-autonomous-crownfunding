import { Contribution } from "@/types/contributions"

export default function formatData(
  contributions: Contribution[],
  totalDistributed: number,
  totalStored: number,
  lastContributionsTransferedAt: number
) {
  return contributions
    ? contributions
        .map((contribution) => {
          const {
            project,
            amountStored,
            amountDistributed,
            startedAt,
            endsAt,
          } = contribution

          return {
            project,
            projectStatus:
              new Date(project.lastActivityAt * 1000) >
              new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
                ? true
                : false,
            amountStored,
            amountDistributed,
            startedAt,
            endsAt,
            totalDistributed,
            totalStored,
            lastContributionsTransferedAt,
          }
        })
        // Sort by most recent first
        .sort((a, b) => Number(b.startedAt) - Number(a.startedAt))
    : null
}
