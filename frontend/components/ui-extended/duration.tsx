import React from "react"

interface DurationComponentProps {
  startTimestamp: number | string | undefined
  endTimestamp: number | string | undefined
}

const DurationComponent: React.FC<DurationComponentProps> = ({
  startTimestamp,
  endTimestamp,
}) => {
  if (!startTimestamp || !endTimestamp) return "unknown date"

  startTimestamp = Number(startTimestamp)
  endTimestamp = Number(endTimestamp)

  const timeDifferenceInSeconds = Math.floor(
    (endTimestamp - startTimestamp) / 1000
  )

  if (timeDifferenceInSeconds < 60) {
    return (
      <>
        {timeDifferenceInSeconds === 1
          ? "1 second"
          : `${timeDifferenceInSeconds} seconds`}
      </>
    )
  }

  const timeDifferenceInMinutes = Math.floor(timeDifferenceInSeconds / 60)
  if (timeDifferenceInMinutes < 60) {
    return (
      <>
        {timeDifferenceInMinutes === 1
          ? "1 minute"
          : `${timeDifferenceInMinutes} minutes`}
      </>
    )
  }

  const timeDifferenceInHours = Math.floor(timeDifferenceInMinutes / 60)
  if (timeDifferenceInHours < 24) {
    return (
      <>
        {timeDifferenceInHours === 1
          ? "1 hour"
          : `${timeDifferenceInHours} hours`}
      </>
    )
  }

  const timeDifferenceInDays = Math.floor(timeDifferenceInHours / 24)
  if (timeDifferenceInDays < 30) {
    return (
      <>
        {timeDifferenceInDays === 1 ? "1 day" : `${timeDifferenceInDays} days`}
      </>
    )
  }

  const timeDifferenceInMonths = Math.floor(timeDifferenceInDays / 30)
  if (timeDifferenceInMonths < 12) {
    return (
      <>
        {timeDifferenceInMonths === 1
          ? "1 month"
          : `${timeDifferenceInMonths} months`}
      </>
    )
  }

  const timeDifferenceInYears = Math.floor(timeDifferenceInMonths / 12)
  return (
    <>
      {timeDifferenceInYears === 1
        ? "1 year"
        : `${timeDifferenceInYears} years`}
    </>
  )
}

export default DurationComponent
