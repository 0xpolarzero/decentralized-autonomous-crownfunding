import EthIcon from "@/assets/icons/eth.svg"
import LinkIcon from "@/assets/icons/link.svg"
import MaticIcon from "@/assets/icons/matic.svg"

import { NetworkConfig, NetworkMapping, NetworkName } from "@/types/network"
import { DACAggregatorAbi } from "@/config/constants/abis/DACAggregator"
import { DACContributorAccountAbi } from "@/config/constants/abis/DACContributorAccount"
import { DACProjectAbi } from "@/config/constants/abis/DACProject"
import networkMappingJson from "@/config/constants/networkMapping.json"

export const networkMapping: NetworkMapping =
  networkMappingJson as NetworkMapping

export const currencies = {
  eth: {
    name: "ETH",
    symbol: "ETH",
    decimals: 18,
    roundDecimal: 4,
    icon: EthIcon,
  },
  link: {
    name: "LINK",
    symbol: "LINK",
    decimals: 18,
    roundDecimal: 4,
    icon: LinkIcon,
  },
  matic: {
    name: "MATIC",
    symbol: "MATIC",
    decimals: 18,
    roundDecimal: 4,
    icon: MaticIcon,
  },
}

export const networkConfig: NetworkConfig = {
  defaultNetwork: "matic" as NetworkName,
  defaultCurrency: currencies.matic,

  networks: {
    matic: {
      name: "Polygon",
      chainId: 137,
      blockExplorer: {
        name: "Polygonscan",
        url: "https://polygonscan.com/",
      },
      currency: currencies.matic,
      timeout: 120_000, // 2 minutes
    },
    maticmum: {
      name: "Mumbai",
      chainId: 80001,
      blockExplorer: {
        name: "Polygonscan",
        url: "https://mumbai.polygonscan.com/",
      },
      currency: currencies.matic,
      timeout: 120_000, // 2 minutes
    },
  },
}

export const abi = {
  dacAggregator: DACAggregatorAbi,
  dacProject: DACProjectAbi,
  dacContributorAccount: DACContributorAccountAbi,
}
