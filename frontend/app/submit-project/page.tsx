"use client"

import useGlobalStore from "@/stores/useGlobalStore"

import { Separator } from "@/components/ui/separator"
import { SubmitProjectForm } from "@/components/submit-project-form"

export default function SubmitProjectPage() {
  const { connected } = useGlobalStore((state) => ({
    connected: state.connected,
  }))

  return (
    <section className="container grid items-center gap-6 pb-8 pt-6 md:py-10">
      <div className="flex max-w-[1400px] flex-col items-start gap-2">
        <div className="flex w-[100%] items-center justify-between gap-2">
          <h1 className="text-3xl font-extrabold leading-tight tracking-tighter md:text-4xl">
            Submit a project
          </h1>
        </div>
        <p className="text-muted-foreground">
          Submit a project for a contribution campaign. Each collaborator will
          be able to withdraw funds based on their share, whenever they want.
        </p>
        <Separator />

        {connected ? (
          <SubmitProjectForm />
        ) : (
          <span className="text-lg text-muted-foreground">
            Please connect your wallet to submit a project.
          </span>
        )}
      </div>
    </section>
  )
}
