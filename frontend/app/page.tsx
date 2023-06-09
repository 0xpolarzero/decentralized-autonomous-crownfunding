import Link from "next/link"

import { siteConfig } from "@/config/site"
import { buttonVariants } from "@/components/ui/button"

export default function IndexPage() {
  return (
    <section className="container grid items-center gap-6 pb-8 pt-6 md:py-10">
      <div className="flex max-w-[980px] flex-col items-start gap-2">
        <h1 className="text-3xl font-extrabold leading-tight tracking-tighter md:text-4xl">
          Your decentralized crowdfunding hub.
          <br className="hidden sm:inline" />
          Enabling automated and flexible project support
          <br className="hidden sm:inline" />
          through blockchain technology.
        </h1>
        <p className="max-w-[700px] text-lg text-muted-foreground">
          Cascade is a crowdfunding platform with a difference. It enables a new
          level of{" "}
          <b>control and flexibility in supporting projects you believe in</b>.
          Leveraging <b>Chainlink Automation</b>, Cascade ensures{" "}
          <b>precise, periodic payments</b> to chosen projects, embodying the
          continuous flow its name suggests. Instead of dealing with recurring
          bank deductions, you dedicate an amount of your choice from your
          contributor account, for each project. These funds are then
          automatically distributed at intervals you specify.
          <br className="hidden sm:inline" />
          <br className="hidden sm:inline" />
          <b>
            Join Cascade, where your contributions seamlessly flow towards
            innovation and growth.
          </b>
        </p>
      </div>
      <div className="flex gap-4">
        <Link
          href={
            siteConfig.mainNav.find((nav) => nav.slug === "projects")?.href ||
            "/"
          }
          target="_blank"
          rel="noreferrer"
          className={buttonVariants()}
        >
          Explore projects
        </Link>
      </div>
    </section>
  )
}
