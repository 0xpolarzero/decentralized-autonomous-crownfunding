import { useToast } from "@/components/ui/use-toast"

const useCopyToClipboard = () => {
  const { toast } = useToast()

  const copyToClipboard = (text: string): void => {
    try {
      navigator.clipboard.writeText(text)

      toast({
        description: "Copied to clipboard",
        // variant: "destructive",
      })
    } catch (err) {
      console.error("Failed to copy to clipboard:", err)
      toast({
        description: "Failed to copy to clipboard",
      })
    }
  }

  return copyToClipboard
}

export default useCopyToClipboard
