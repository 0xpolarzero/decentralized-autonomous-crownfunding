export type SiteConfig = typeof siteConfig

export const siteConfig = {
  name: "Cascade",
  description:
    "Aour decentralized crowdfunding hub, enabling automated and flexible project support through blockchain technology.",
  url: "https://cascade.polarzero.xyz",
  mainNav: [
    // {
    //   title: "Home",
    //   slug: "home",
    //   href: "/",
    // },
    {
      title: "Explore projects",
      slug: "explore",
      href: "/explore",
      iconName: "LucideCompass",
    },
    {
      title: "Dashboard",
      slug: "dashboard",
      children: [
        {
          title: "Contributor account",
          slug: "account-contributor",
          href: "/account-contributor",
          description:
            "Manage your contributor account (contributions, payments).",
          iconName: "LucideWallet",
        },
        {
          title: "Projects",
          slug: "account-projects",
          href: "/account-projects",
          description: "Interact with the projects you're involved in.",
          iconName: "LucidePresentation",
        },
      ],
    },
    // {
    //   title: "Documentation",
    //   slug: "docs",
    //   href: "/docs",
    // },
  ],
  links: {
    twitter: "https://twitter.com/0xpolarzero",
    github:
      "https://github.com/0xpolarzero/decentralized-autonomous-crownfunding",
    docs: "https://ui.shadcn.com",
  },
}
