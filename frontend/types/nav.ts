export interface NavItem {
  title: string
  slug: string
  href?: string
  disabled?: boolean
  external?: boolean
  // children?: NavItem[]
  children?: Array<Omit<NavItem, "children">>
  description?: string
  iconName?: string
}
