export interface NetworkMapping {
  [key: string]: {
    DACAggregator: `0x${string}`[]
  }
}

export type NetworkName = "matic" | "maticmum"

export interface NetworkInfo {
  name: string
  chainId: number
  blockExplorer: {
    name: string
    url: string
  }
  currency: {
    name: string
    symbol: string
    decimals: number
    icon: string
  }
  timeout: number
}

export interface NetworkConfig {
  defaultNetwork: NetworkName
  defaultCurrency: NetworkInfo["currency"]
  networks: {
    [key in NetworkName]: NetworkInfo
  }
}
