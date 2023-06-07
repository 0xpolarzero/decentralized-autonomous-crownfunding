"use client"

import { useState } from "react"
import Link from "next/link"
import useGlobalStore from "@/stores/useGlobalStore"
import { zodResolver } from "@hookform/resolvers/zod"
import { waitForTransaction } from "@wagmi/core"
import { Loader2 } from "lucide-react"
import { useForm } from "react-hook-form"
import { useContractWrite } from "wagmi"
import * as z from "zod"

import { DACAggregatorAbi } from "@/config/constants/abis/DACAggregator"
import { networkConfig, networkMapping } from "@/config/network"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui-custom/form"

const isValidUrl = (url: string) => {
  try {
    new URL(url)
    return true
  } catch (e) {
    return false
  }
}

const formSchema = z
  .object({
    // Project name must be between 2 and 50 characters
    projectName: z.string().min(2).max(50),
    // Description is optional
    projectDescription: z.string().optional(),
    // Links are optional, but should be string of valid urls separated by commas
    projectLinks: z
      .string()
      .optional()
      .refine((val) => {
        if (!val) return true
        const urls = val.split(",")
        return urls.every(isValidUrl)
      }),
    // Tags are optional
    projectTags: z.string().optional(),
    // Collaborators should be at least 1 address long
    projectCollaborators: z.array(z.string()).min(1),
    // Same for shares with a total of 100
    projectShares: z
      .array(z.number())
      .min(1)
      .refine((val) => val.reduce((a, b) => a + b, 0) === 100),
  })
  // Collaborators & shares should be the same length
  .refine(
    (data) => data.projectCollaborators.length === data.projectShares.length,
    {
      message: "Collaborators and shares should be the same length",
      path: ["projectCollaborators", "projectShares"],
    }
  )

export function SubmitProjectForm() {
  const { address, currentNetwork } = useGlobalStore((state) => ({
    address: state.address,
    currentNetwork: state.currentNetwork,
  }))

  const { toast } = useToast()
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      projectName: "",
      projectDescription: "",
      projectLinks: "",
      projectTags: "",
      projectCollaborators: [address],
      projectShares: [],
    },
  })

  const networkInfo =
    currentNetwork || networkConfig.networks[networkConfig.defaultNetwork]

  const [isProcessingTransaction, setIsProcessingTransaction] =
    useState<boolean>(false)

  function onFormSubmit(values: z.infer<typeof formSchema>) {
    console.log(values)
  }

  const { isLoading: isSubmittingProject, write: submitProject } =
    useContractWrite({
      address: networkMapping[networkInfo.chainId]["DACAggregator"][0],
      abi: DACAggregatorAbi,
      functionName: "submitProject",
      // args: [
      //   projectCollaborators,
      //   projectShares,
      //   projectName,
      //   projectDescription,
      //   projectLinks,
      //   projectTags,
      // ],

      onSuccess: async (tx) => {
        setIsProcessingTransaction(true)

        const receipt = await waitForTransaction({
          hash: tx.hash,
          confirmations: 2,
        })
        console.log(receipt)

        if (receipt.status === "success") {
          toast({
            title: "Project submitted",
            description: (
              <>
                <p>Your project was successfully submitted.</p>
                <p>
                  <Link
                    href={`${networkInfo.blockExplorer.url}tx/${tx.hash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline"
                  >
                    See on block explorer
                  </Link>
                </p>
              </>
            ),
          })
        } else {
          toast({
            variant: "destructive",
            title: "Something went wrong",
            description: "Please try again.",
          })
        }

        setIsProcessingTransaction(false)
      },
      onError: (err) => {
        toast({
          variant: "destructive",
          title: "Something went wrong",
          description: "Please try again.",
        })
        console.error(err)
      },
    })

  return (
    <div className="w-full">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onFormSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="projectName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <Input placeholder="Project's name" {...field} />
                </FormControl>
                <FormDescription>
                  This is your public display name.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <div
            className={`flex grow items-center ${
              isProcessingTransaction ? "justify-between" : "justify-end"
            }`}
          >
            {isProcessingTransaction ? (
              <span className="justify-self-start text-sm text-gray-400">
                Your project is being submitted...
              </span>
            ) : null}
            <Button type="submit" disabled={isSubmittingProject}>
              {isSubmittingProject ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Submit
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
