import Link from "next/link"

export function Footer() {
  return (
    <div className="container flex w-full items-center pb-2 text-center">
      <div className="w-full text-xs text-muted-foreground">
        Built by{" "}
        <Link
          href="https://polarzero.xyz"
          target="_blank"
          rel="noopener noreferrer"
        >
          polarzero
        </Link>{" "}
        with{" "}
        <Link
          href="https://ui.shadcn.com/"
          target="_blank"
          rel="noopener noreferrer"
        >
          shadcn/ui
        </Link>
      </div>
    </div>
  )
}
