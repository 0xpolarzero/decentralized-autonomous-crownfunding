import { NetworkMapping } from "@/types/network-mapping"
import dacAggregatorAbi from "@/config/constants/abis/DACAggregator.json"
import dacContributorAccountAbi from "@/config/constants/abis/DACContributorAccount.json"
import dacProjectAbi from "@/config/constants/abis/DACProject.json"
import networkMappingJson from "@/config/constants/networkMapping.json"

export const networkMapping: NetworkMapping =
  networkMappingJson as NetworkMapping

export type ChainConfig = typeof chainConfig

export type NetworkName = "polygon" | "mumbai"

export const chainConfig = {
  defaultNetwork: "polygon" as NetworkName,

  networks: {
    matic: {
      name: "Polygon",
      chainId: 137,
      blockExplorer: {
        name: "Polygonscan",
        url: "https://polygonscan.com/",
      },
      currency: {
        name: "MATIC",
        symbol: "MATIC",
        decimals: 18,
      },
    },
    maticmum: {
      name: "Mumbai",
      chainId: 80001,
      blockExplorer: {
        name: "Polygonscan",
        url: "https://mumbai.polygonscan.com/",
      },
      currency: {
        name: "MATIC",
        symbol: "MATIC",
        decimals: 18,
      },
    },
  },
}

export const abi = {
  dacAggregator: dacAggregatorAbi,
  dacProject: dacProjectAbi,
  dacContributorAccount: dacContributorAccountAbi,
}
