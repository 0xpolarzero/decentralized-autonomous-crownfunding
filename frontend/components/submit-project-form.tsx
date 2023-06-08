"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import useGlobalStore from "@/stores/useGlobalStore"
import { useQuery } from "@apollo/client"
import { zodResolver } from "@hookform/resolvers/zod"
import { waitForTransaction } from "@wagmi/core"
import { Loader2, LucideAsterisk } from "lucide-react"
import { useFieldArray, useForm } from "react-hook-form"
import { useContractWrite } from "wagmi"
import * as z from "zod"

import { Project } from "@/types/projects"
import { DACAggregatorAbi } from "@/config/constants/abis/DACAggregator"
import { GET_PROJECTS } from "@/config/constants/subgraph-queries"
import { networkConfig, networkMapping } from "@/config/network"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
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
import TagInput from "@/components/ui-extended/tag-input"

/* -------------------------------------------------------------------------- */
/*                                   SCHEMA                                   */
/* -------------------------------------------------------------------------- */

const formSchema = z.object({
  // Project name must be between 2 and 50 characters
  projectName: z.string().min(2).max(50),
  // Description is optional
  projectDescription: z.string().optional(),
  // Links are optional, but should be an array of strings of valid urls
  // We need to use an object for the field array to work
  projectLinks: z.array(z.object({ url: z.string().url() })).optional(),
  // Tags are optional, but should be an array of strings
  projectTags: z.array(z.string()).optional(),
  // Collaborators should be at least 1 address long
  // Same for shares with a total of 100
  projectCollaborators: z
    .array(
      z.object({
        address: z.string(),
        share: z.string(),
      })
    )
    .min(1)
    .refine((val) => val.every((v) => !isNaN(Number(v.share))), {
      message: "Shares must be valid numbers",
    })
    .refine((val) => val.reduce((a, b) => a + Number(b.share), 0) === 100, {
      message: "Shares must add up to 100",
    }),

  // Must accept terms and conditions
  conditions: z
    .boolean()
    .default(false)
    .refine((val) => val === true),
})

type FormSchema = z.infer<typeof formSchema>

/* -------------------------------------------------------------------------- */
/*                                    FORM                                    */
/* -------------------------------------------------------------------------- */

const Required = () => (
  <span className="absolute ml-2 mt-0.5">
    <LucideAsterisk size={10} color="var(--light-red)" />
  </span>
)

export function SubmitProjectForm() {
  // Store
  const { address, currentNetwork } = useGlobalStore((state) => ({
    address: state.address,
    currentNetwork: state.currentNetwork,
  }))

  // Queries
  const { data: projectsData } = useQuery(GET_PROJECTS, {
    variables: { amountPerPage: 1000, skip: 0 },
  })

  const { toast } = useToast()

  // Form (zod & react-hook-form)
  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      projectName: "",
      projectDescription: "",
      projectLinks: [{ url: "" }],
      projectTags: [],
      projectCollaborators: [{ address: address, share: "100" }],
      conditions: false,
    },
    mode: "onChange",
  })
  const {
    fields: linkFields,
    append: appendLink,
    remove: removeLink,
  } = useFieldArray({
    control: form.control,
    name: "projectLinks",
  })
  const {
    fields: collaboratorsFields,
    append: appendCollaborator,
    remove: removeCollaborator,
  } = useFieldArray({
    control: form.control,
    name: "projectCollaborators",
  })

  const projectTags = form.watch("projectTags")

  // Network & states
  const networkInfo =
    currentNetwork || networkConfig.networks[networkConfig.defaultNetwork]

  const [isProcessingTransaction, setIsProcessingTransaction] =
    useState<boolean>(false)
  const [existingTags, setExistingTags] = useState<string[]>([])

  function onFormSubmit(values: z.infer<typeof formSchema>) {
    const args = [
      values.projectCollaborators.map((collaborator) => collaborator.address),
      values.projectCollaborators.map((collaborator) =>
        Number(collaborator.share)
      ),
      values.projectName,
      values.projectDescription,
      values.projectLinks?.map((link) => link.url.trim()).join(",") || "",
      values.projectTags?.join(",") || "",
    ]

    submitProject({ args })
  }

  const { isLoading: isSubmittingProject, write: submitProject } =
    useContractWrite({
      address: networkMapping[networkInfo.chainId]["DACAggregator"][0],
      abi: DACAggregatorAbi,
      functionName: "submitProject",

      onSuccess: async (tx) => {
        setIsProcessingTransaction(true)

        const receipt = await waitForTransaction({
          hash: tx.hash,
          confirmations: 5,
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

  useEffect(() => {
    if (projectsData && projectsData.projects) {
      const gatheredTags = projectsData.projects.reduce(
        (acc: string[], project: Project) => {
          return [...acc, ...project.tags]
        },
        []
      )

      setExistingTags(gatheredTags)
    }
  }, [projectsData])

  return (
    <div className="w-full">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onFormSubmit)} className="space-y-4">
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
                <FormMessage />
              </FormItem>
            )}
          />
          {/* -------------------------------------------------------------------------- */
          /*                                projectLinks                                */
          /* -------------------------------------------------------------------------- */}
          <div className="mt-4" />
          <span className="text-sm font-medium leading-none">Links</span>

          {linkFields.map((linkField, index) => (
            <FormField
              control={form.control}
              name={`projectLinks.${index}.url`}
              key={linkField.id}
              render={({ field }) => (
                <FormItem>
                  <FormControl className="mt-0">
                    <div>
                      <div className="mb-2 flex w-[100%] items-center gap-2">
                        <FormLabel className="text-muted-foreground">
                          {index + 1}
                        </FormLabel>
                        <Input
                          className="mt-0"
                          {...field}
                          placeholder="Enter a URL"
                          defaultValue={linkField.url}
                        />
                        <Button
                          variant="secondary"
                          onClick={() => removeLink(index)}
                        >
                          Delete
                        </Button>
                      </div>
                      <FormMessage />
                    </div>
                  </FormControl>
                </FormItem>
              )}
            />
          ))}

          <Button
            className="w-[100%]"
            variant="secondary"
            onClick={() =>
              appendLink({
                url: "",
              })
            }
          >
            Add link
          </Button>

          {/* -------------------------------------------------------------------------- */
          /*                                 projectTags                                */
          /* -------------------------------------------------------------------------- */}
          <TagInput
            options={existingTags}
            onChange={(newTags) => form.setValue("projectTags", newTags)}
          />

          {/* -------------------------------------------------------------------------- */
          /*                            projectCollaborators                            */
          /* -------------------------------------------------------------------------- */}
          <div className="mt-4" />
          <span className="text-sm font-medium leading-none">
            Collaborators
          </span>

          {collaboratorsFields.map((collaboratorField, index) => (
            <div key={collaboratorField.id} className="w-[100%]">
              <div className="mb-2 flex w-[100%] items-center gap-2">
                <FormLabel className="text-muted-foreground">
                  {index + 1}
                </FormLabel>
                <FormField
                  control={form.control}
                  name={`projectCollaborators.${index}.address`}
                  render={({ field }) => (
                    <FormItem className="grow">
                      <FormControl className="mt-0">
                        <Input
                          {...field}
                          placeholder="Enter an address"
                          defaultValue={collaboratorField.address}
                          disabled={index === 0}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`projectCollaborators.${index}.share`}
                  render={({ field }) => (
                    <FormItem>
                      <FormControl className="mt-0">
                        <Input
                          {...field}
                          placeholder="Enter a share"
                          defaultValue={collaboratorField.share}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <Button
                  variant="secondary"
                  onClick={() => removeCollaborator(index)}
                  disabled={index === 0}
                >
                  Delete
                </Button>
              </div>
              <FormMessage />
              {index === 0 ? (
                <FormDescription>
                  The share will be a percentage of the revenue from the
                  contributions.
                </FormDescription>
              ) : null}
              {index === collaboratorsFields.length - 1 &&
              form.formState.errors.projectCollaborators ? (
                <FormMessage>
                  {form.formState.errors.projectCollaborators.message}
                </FormMessage>
              ) : null}
            </div>
          ))}
          <Button
            className="w-[100%]"
            variant="secondary"
            onClick={() =>
              appendCollaborator({
                address: "",
                share: "0",
              })
            }
          >
            Add collaborator
          </Button>

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
