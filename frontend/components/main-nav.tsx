"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import {
  LucideCompass,
  LucidePresentation,
  LucideWallet,
  PanelTopOpen,
} from "lucide-react"
import { useTheme } from "next-themes"

import { NavItem } from "@/types/nav"
import { siteConfig } from "@/config/site"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
import { Icons } from "@/components/icons"

interface MainNavProps {
  items?: NavItem[]
}

const iconComponents = {
  LucideCompass: LucideCompass,
  LucideWallet: LucideWallet,
  LucidePresentation: LucidePresentation,
  // ...
}

export function MainNav({ items }: MainNavProps) {
  const { theme } = useTheme()

  return (
    <div className="flex gap-6 md:gap-10">
      <Link href="/" className="flex items-center space-x-2">
        {/* <Icons.logo className="h-6 w-6" /> */}
        <Image
          src={theme === "dark" ? Icons.logoWhite : Icons.logoBlack}
          alt="Logo"
          width={24}
          height={24}
        />
        <span className="inline-block font-bold">{siteConfig.name}</span>
      </Link>

      {/* Nav large */}
      <NavigationMenu className="hidden md:block">
        <NavigationMenuList>
          {items?.map((item) => {
            if (item.children) {
              // Render a parent menu item with a dropdown
              return (
                <NavigationMenuItem key={item.title}>
                  <NavigationMenuTrigger>{item.title}</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid gap-3 p-4 md:w-[400px] lg:w-[650px] lg:grid-cols-[.75fr_1fr]">
                      {item.children.map((child) => (
                        <ListItem
                          key={child.title}
                          href={child.href}
                          title={child.title}
                        >
                          <span className="text-xs">{child.description}</span>
                        </ListItem>
                      ))}
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              )
            } else {
              // Render a simple menu item with no dropdown
              return (
                <NavigationMenuItem key={item.title}>
                  <Link href={item.href || ""} legacyBehavior passHref>
                    <NavigationMenuLink
                      className={navigationMenuTriggerStyle()}
                    >
                      {item.title}
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>
              )
            }
          })}
        </NavigationMenuList>
      </NavigationMenu>

      {/* Nav small */}
      <DropdownMenu>
        <DropdownMenuTrigger className="block md:hidden" asChild>
          <Button variant="ghost" className="flex items-center gap-2">
            <PanelTopOpen size={20} />{" "}
            <span className="text-muted-foreground">Menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="block min-w-[250px] md:hidden">
          {items?.map((item) => {
            if (item.children) {
              return (
                <div key={item.title}>
                  <DropdownMenuLabel>{item.title}</DropdownMenuLabel>
                  {item.children.map((child) => {
                    const IconComponent = child.iconName
                      ? iconComponents[
                          child.iconName as keyof typeof iconComponents
                        ]
                      : null

                    return (
                      <Link href={child.href || ""} key={child.title}>
                        <DropdownMenuItem className="flex items-center gap-2">
                          {IconComponent ? <IconComponent size={16} /> : null}{" "}
                          {child.title}
                        </DropdownMenuItem>
                      </Link>
                    )
                  })}
                </div>
              )
            } else {
              const IconComponent = item.iconName
                ? iconComponents[item.iconName as keyof typeof iconComponents]
                : null

              return (
                <Link href={item.href || ""} key={item.title}>
                  <DropdownMenuItem className="flex items-center gap-2">
                    {IconComponent ? <IconComponent size={16} /> : null}{" "}
                    {item.title}
                  </DropdownMenuItem>
                </Link>
              )
            }
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a">
>(({ className, title, children, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            className
          )}
          {...props}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {children}
          </p>
        </a>
      </NavigationMenuLink>
    </li>
  )
})
ListItem.displayName = "ListItem"
