import { Loader2 } from "lucide-react"

export default function Loading() {
  return (
    <div className="flex justify-center items-center h-screen">
      <Loader2 className="w-10 h-10 opacity-50 animate-spin" />
    </div>
  )
}
