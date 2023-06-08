import { calculate } from "@/helpers/calculate"

import { Contribution } from "@/types/contributions"

export default function formatData(
  contributions: Contribution[],
  totalDistributed: number,
  totalStored: number,
  paymentInterval: BigInt
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
            id: contribution.id,
            index: Number(contribution.id.split("-")[1]),
            project,
            projectStatus:
              new Date(Number(project.lastActivityAt) * 1000) >
              new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
                ? true
                : false,
            amountStored: Number(amountStored),
            amountDistributed: Number(amountDistributed),
            startedAt: Number(startedAt),
            endsAt: Number(endsAt),
            totalDistributed: Number(totalDistributed),
            totalStored: Number(totalStored),
            pending: calculate.totalContributions(
              contributions,
              Number(paymentInterval),
              new Date().getTime() / 1000
            ),
          }
        })
        // Sort by most recent first
        .sort((a, b) => Number(b.startedAt) - Number(a.startedAt))
    : null
}
