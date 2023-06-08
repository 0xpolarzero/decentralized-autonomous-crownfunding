import { Contribution, ContributionToSend } from "@/types/contributions"

const isProjectStillActive = (lastActivityAt: number): boolean =>
  new Date().getTime() - lastActivityAt * 1000 < 1000 * 60 * 60 * 24 * 30 // 30 days

const isContributionAlreadyDistributed = (
  contribution: Contribution
): boolean => contribution.amountDistributed === contribution.amountStored

const calculateContributions = (
  contributions: Contribution[],
  paymentInterval: number,
  paymentTimestamp: number
): ContributionToSend[] => {
  let contributionsToSend: ContributionToSend[] = []

  for (let i = 0; i < contributions.length; i++) {
    if (
      isProjectStillActive(Number(contributions[i].project.lastActivityAt)) &&
      !isContributionAlreadyDistributed(contributions[i])
    ) {
      const amountToSend = calculateIndividualContribution(
        contributions[i],
        paymentInterval,
        paymentTimestamp
      )

      if (amountToSend > 0) {
        contributionsToSend.push({
          id: contributions[i].id,
          project: contributions[i].project,
          amount: amountToSend,
          index: i,
        })
      }
    }
  }

  return contributionsToSend
}

const calculateIndividualContribution = (
  contribution: Contribution,
  paymentInterval: number,
  paymentTimestamp: number
): number => {
  if (isContributionAlreadyDistributed(contribution)) return 0

  if (Number(contribution.endsAt) < paymentTimestamp)
    return (
      Number(contribution.amountStored) - Number(contribution.amountDistributed)
    ) // Send everything left

  const remainingDuration = Number(contribution.endsAt) - paymentTimestamp
  const remainingIntervals = Math.floor(remainingDuration / paymentInterval)
  const remainingAmount =
    Number(contribution.amountStored) - Number(contribution.amountDistributed)

  return Math.floor(remainingAmount / (remainingIntervals + 2))
}

export const calculate = {
  totalContributions: calculateContributions,
  //   contribution: calculateIndividualContribution,
}
