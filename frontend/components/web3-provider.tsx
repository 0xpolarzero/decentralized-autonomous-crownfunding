"use client"

import * as React from "react"
import { ConnectKitProvider, getDefaultConfig } from "connectkit"
import { useTheme } from "next-themes"
import { polygon, polygonMumbai } from "viem/chains"
import { WagmiConfig, createConfig } from "wagmi"

import { Web3ProviderProps } from "@/types/web3-provider"
import { siteConfig } from "@/config/site"

const chains = [polygon, polygonMumbai]

const config = createConfig(
  getDefaultConfig({
    alchemyId: process.env.ALCHEMY_ID || "",
    walletConnectProjectId: process.env.WALLETCONNECT_PROJECT_ID || "",
    chains,
    appName: siteConfig.name,
    appDescription: siteConfig.description,
    appUrl: siteConfig.url,
    // appLogo: Icons.logo
  })
)

export function Web3Provider({ children, ...props }: Web3ProviderProps) {
  const { theme } = useTheme()

  return (
    <React.Fragment {...props}>
      <WagmiConfig config={config}>
        <ConnectKitProvider
          mode={theme === "dark" ? "dark" : "light"}
          customTheme={{
            "--ck-font-family": "var(--font-mono), monospace",
          }}
        >
          {children}
        </ConnectKitProvider>
      </WagmiConfig>
    </React.Fragment>
  )
}
