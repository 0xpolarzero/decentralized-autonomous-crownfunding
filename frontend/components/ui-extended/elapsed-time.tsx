import React from "react"

interface ElapsedTimeComponentProps {
  timestamp: number | string | undefined
}

const ElapsedTimeComponent: React.FC<ElapsedTimeComponentProps> = ({
  timestamp,
}) => {
  if (!timestamp) return "unknown date"

  timestamp = Number(timestamp)

  const timeDifferenceInSeconds = Math.floor((Date.now() - timestamp) / 1000)

  if (timeDifferenceInSeconds < 60) {
    return (
      <>
        {timeDifferenceInSeconds === 1
          ? "1 second ago"
          : `${timeDifferenceInSeconds} seconds ago`}
      </>
    )
  }

  const timeDifferenceInMinutes = Math.floor(timeDifferenceInSeconds / 60)
  if (timeDifferenceInMinutes < 60) {
    return (
      <>
        {timeDifferenceInMinutes === 1
          ? "1 minute ago"
          : `${timeDifferenceInMinutes} minutes ago`}
      </>
    )
  }

  const timeDifferenceInHours = Math.floor(timeDifferenceInMinutes / 60)
  if (timeDifferenceInHours < 24) {
    return (
      <>
        {timeDifferenceInHours === 1
          ? "1 hour ago"
          : `${timeDifferenceInHours} hours ago`}
      </>
    )
  }

  const timeDifferenceInDays = Math.floor(timeDifferenceInHours / 24)
  if (timeDifferenceInDays < 30) {
    return (
      <>
        {timeDifferenceInDays === 1
          ? "1 day ago"
          : `${timeDifferenceInDays} days ago`}
      </>
    )
  }

  const timeDifferenceInMonths = Math.floor(timeDifferenceInDays / 30)
  if (timeDifferenceInMonths < 12) {
    return (
      <>
        {timeDifferenceInMonths === 1
          ? "1 month ago"
          : `${timeDifferenceInMonths} months ago`}
      </>
    )
  }

  const timeDifferenceInYears = Math.floor(timeDifferenceInMonths / 12)
  return (
    <>
      {timeDifferenceInYears === 1
        ? "1 year ago"
        : `${timeDifferenceInYears} years ago`}
    </>
  )
}

export default ElapsedTimeComponent
