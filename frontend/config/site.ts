export type SiteConfig = typeof siteConfig

export const siteConfig = {
  name: "Cascade",
  description:
    "Aour decentralized crowdfunding hub, enabling automated and flexible project support through blockchain technology.",
  url: "",
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
      title: "Contributor account",
      slug: "account",
      href: "/account",
    },
  ],
  links: {
    twitter: "https://twitter.com/0xpolarzero",
    github:
      "https://github.com/0xpolarzero/decentralized-autonomous-crownfunding",
    docs: "https://ui.shadcn.com",
  },
}
