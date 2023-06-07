"use client"

import { useState } from "react"
import Link from "next/link"
import useGlobalStore from "@/stores/useGlobalStore"
import { zodResolver } from "@hookform/resolvers/zod"
import { waitForTransaction } from "@wagmi/core"
import { Loader2, LucideAsterisk } from "lucide-react"
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
} from "@/components/ui-extended/form"

import { Checkbox } from "./ui/checkbox"

/* -------------------------------------------------------------------------- */
/*                                   SCHEMA                                   */
/* -------------------------------------------------------------------------- */

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
    // Links are optional, but should be an array of strings of valid urls
    projectLinks: z
      .array(z.string())
      .optional()
      .refine((val) => {
        if (!val) return true
        return val.every(isValidUrl)
      }),
    // Tags are optional, but should be an array of strings
    projectTags: z.array(z.string()).optional(),
    // Collaborators should be at least 1 address long
    projectCollaborators: z.array(z.string()).min(1),
    // Same for shares with a total of 100
    projectShares: z
      .array(z.number())
      .min(1)
      .refine((val) => val.reduce((a, b) => a + b, 0) === 100),
    // Must accept terms and conditions
    conditions: z
      .boolean()
      .default(false)
      .refine((val) => val === true),
  })
  // Collaborators & shares should be the same length
  .refine(
    (data) => data.projectCollaborators.length === data.projectShares.length,
    {
      message: "Collaborators and shares should be the same length",
      path: ["projectCollaborators", "projectShares"],
    }
  )

/* -------------------------------------------------------------------------- */
/*                                    FORM                                    */
/* -------------------------------------------------------------------------- */

const Required = () => (
  <span className="absolute ml-2 mt-0.5">
    <LucideAsterisk size={10} color="var(--light-red)" />
  </span>
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
      projectLinks: [],
      projectTags: [],
      projectCollaborators: [address],
      projectShares: [],
      conditions: false,
    },
  })

  const networkInfo =
    currentNetwork || networkConfig.networks[networkConfig.defaultNetwork]

  const [isProcessingTransaction, setIsProcessingTransaction] =
    useState<boolean>(false)

  function onFormSubmit(values: z.infer<typeof formSchema>) {
    console.log(values)
    // Transform links & tags to string
    // submit
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
          {/* -------------------------------------------------------------------------- */
          /*                                 projectName                                */
          /* -------------------------------------------------------------------------- */}
          <FormField
            control={form.control}
            name="projectName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Name <Required />
                </FormLabel>
                <FormControl>
                  <Input placeholder="The name of the project" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* -------------------------------------------------------------------------- */
          /*                             projectDescription                             */
          /* -------------------------------------------------------------------------- */}
          <FormField
            control={form.control}
            name="projectDescription"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Input
                    placeholder="A short description of the project"
                    {...field}
                  />
                </FormControl>
                {/* <FormDescription>
                  This is the name of the project.
                </FormDescription> */}
                <FormMessage />
              </FormItem>
            )}
          />
          {/* -------------------------------------------------------------------------- */
          /*                                projectLinks                                */
          /* -------------------------------------------------------------------------- */}
          <FormField
            control={form.control}
            name="projectLinks"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Links</FormLabel>
                <FormControl>
                  {/* Can add multiple inputs for strings */}
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* ADD CHECKBOX 'You understand that EVERYTHING is stored onchain... will keep a transparent track of the project and its contributions' */}
          {/* -------------------------------------------------------------------------- */
          /*                                 conditions                                 */
          /* -------------------------------------------------------------------------- */}
          <FormField
            control={form.control}
            name="conditions"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>
                    You understand that{" "}
                    <span className="underline">everything</span> on this
                    platform is stored on chain.
                  </FormLabel>
                  <FormDescription>
                    All records of the project, including the contributions,
                    will be publicly and transparently available.
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />

          {/* -------------------------------------------------------------------------- */
          /*                                   FOOTER                                   */
          /* -------------------------------------------------------------------------- */}
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
