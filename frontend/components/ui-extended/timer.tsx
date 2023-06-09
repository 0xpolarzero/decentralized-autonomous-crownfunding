import React, { useEffect, useState } from "react"

interface TimerComponentProps {
  targetTimestamp: number
}

const TimerComponent: React.FC<TimerComponentProps> = ({ targetTimestamp }) => {
  const [remainingTime, setRemainingTime] = useState<string>("")

  useEffect(() => {
    const intervalId = setInterval(() => {
      const currentTime = Date.now()
      const timeRemaining = targetTimestamp - currentTime

      if (timeRemaining <= 0) {
        setRemainingTime("Expired")
        clearInterval(intervalId)
      } else {
        setRemainingTime(formatDuration(timeRemaining))
      }
    }, 1000)

    return () => clearInterval(intervalId)
  }, [targetTimestamp])

  const formatDuration = (milliseconds: number) => {
    let totalSeconds = Math.floor(milliseconds / 1000)
    const days = Math.floor(totalSeconds / (24 * 60 * 60))
    totalSeconds %= 24 * 60 * 60
    const hours = Math.floor(totalSeconds / (60 * 60))
    totalSeconds %= 60 * 60
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = totalSeconds % 60

    const years = Math.floor(days / 365)
    const months = Math.floor((days % 365) / 30)

    let result = ""

    if (years > 0) {
      result += `${years} years `
    }

    if (months > 0) {
      result += `${months} months `
    }

    if (days > 0 && years === 0) {
      result += `${days} days `
    }

    if (hours > 0 && months === 0) {
      result += `${hours}:`
    }

    if (minutes < 10) {
      result += `0${minutes}:`
    } else {
      result += `${minutes}:`
    }

    if (seconds < 10) {
      result += `0${seconds}`
    } else {
      result += `${seconds}`
    }

    return result
  }

  return <>{remainingTime}</>
}

export default TimerComponent
