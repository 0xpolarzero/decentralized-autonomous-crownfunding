import { useToast } from "@/components/ui/use-toast"

const copyToClipboard = (text: string): void => {
  const { toast } = useToast()

  try {
    navigator.clipboard.writeText(text)

    toast({
      description: "Copied to clipboard",
      variant: "destructive",
    })
  } catch (err) {
    console.error("Failed to copy to clipboard:", err)
    toast({
      description: "Failed to copy to clipboard",
    })
  }
}

export default copyToClipboard
