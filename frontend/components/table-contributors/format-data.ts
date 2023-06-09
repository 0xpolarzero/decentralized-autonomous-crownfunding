import { Contribution } from "@/types/contributions"

export default function formatData(
  contributors: Contribution[] | undefined,
  totalRaised: number
) {
  const totalStored = contributors?.reduce(
    (acc, contributor) => acc + Number(contributor.amountStored),
    0
  )

  return contributors
    ? contributors
        .map((contributor) => {
          const {
            account,
            amountStored,
            amountDistributed,
            startedAt,
            endsAt,
          } = contributor

          const { owner, accountContract } = account

          return {
            owner,
            accountContract,
            amountStored: Number(amountStored),
            amountDistributed: Number(amountDistributed),
            startedAt: Number(startedAt),
            endsAt: Number(endsAt),
            totalRaised: Number(totalRaised),
            totalStored: Number(totalStored),
          }
        })
        // Sort by most recent first
        .sort((a, b) => Number(b.startedAt) - Number(a.startedAt))
    : null
}
