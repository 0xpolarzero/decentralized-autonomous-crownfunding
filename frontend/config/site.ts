export type SiteConfig = typeof siteConfig

export const siteConfig = {
  name: "Cascade",
  description:
    "Aour decentralized crowdfunding hub, enabling automated and flexible project support through blockchain technology.",
  url: "https://cascade.polarzero.xyz",
  mainNav: [
    {
      title: "Home",
      slug: "home",
      href: "/",
    },
    {
      title: "Explore projects",
      slug: "explore",
      href: "/explore",
    },
    {
      title: "Contributor dashboard",
      slug: "dashboard",
      href: "/dashboard",
    },
  ],
  links: {
    twitter: "https://twitter.com/0xpolarzero",
    github:
      "https://github.com/0xpolarzero/decentralized-autonomous-crownfunding",
    docs: "https://ui.shadcn.com",
  },
}
