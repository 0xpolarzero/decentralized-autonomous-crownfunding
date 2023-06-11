import { useEffect, useState } from "react"

const breakpoints = {
  xs: 0,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
}

type WindowSize = "xs" | "sm" | "md" | "lg" | "xl" | "2xl"

const getScreenSize = (width: number): WindowSize => {
  if (width < breakpoints.sm) return "xs"
  if (width < breakpoints.md) return "sm"
  if (width < breakpoints.lg) return "md"
  if (width < breakpoints.xl) return "lg"
  if (width < breakpoints["2xl"]) return "xl"
  return "2xl"
}

const useWindowSize = () => {
  const [width, setWidth] = useState<number>(window?.innerWidth)
  const [windowSize, setWindowSize] = useState<WindowSize>(
    getScreenSize(window?.innerWidth)
  )

  const isSizeSmallerThan = (compareWith: WindowSize): boolean => {
    return breakpoints[windowSize] < breakpoints[compareWith]
  }

  useEffect(() => {
    if (!window) return

    const handleResize = () => {
      setWindowSize(getScreenSize(window.innerWidth))
      setWidth(window.innerWidth)
    }

    window.addEventListener("resize", handleResize)

    return () => {
      window.removeEventListener("resize", handleResize)
    }
  }, [])

  return { width, windowSize, isSizeSmallerThan }
}

export default useWindowSize
