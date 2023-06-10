import EthIcon from "@/assets/icons/eth.svg"
import LinkIcon from "@/assets/icons/link.svg"
import MaticIcon from "@/assets/icons/matic.svg"

import { NetworkConfig, NetworkMapping, NetworkName } from "@/types/network"
import { DACAggregatorAbi } from "@/config/constants/abis/DACAggregator"
import { DACContributorAccountAbi } from "@/config/constants/abis/DACContributorAccount"
import { DACProjectAbi } from "@/config/constants/abis/DACProject"
import networkMappingJson from "@/config/constants/network-mapping.json"

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
  defaultNetwork: "maticmum" as NetworkName,
  defaultCurrency: currencies.matic,

  networks: {
    /// Not yet deployed
    // matic: {
    //   name: "Polygon",
    //   chainId: 137,
    //   blockExplorer: {
    //     name: "Polygonscan",
    //     url: "https://polygonscan.com/",
    //   },
    //   currency: currencies.matic,
    //   timeout: 120_000, // 2 minutes
    //   blockDuration: 2_500, // 2.5 seconds
    //   contracts: {
    //     LINK: "0xb0897686c545045aFc77CF20eC7A532E3120E0F1",
    //     KEEPER_REGISTRY: "0x02777053d6764996e594c3E88AF1D58D5363a2e6",
    //   },
    // },
    maticmum: {
      name: "Mumbai",
      chainId: 80001,
      blockExplorer: {
        name: "Polygonscan",
        url: "https://mumbai.polygonscan.com/",
      },
      currency: currencies.matic,
      timeout: 120_000, // 2 minutes
      blockDuration: 2_500, // 2.5 seconds
      ensSupported: false,
      contracts: {
        LINK: "0x326C977E6efc84E512bB9C30f76E30c160eD06FB",
        KEEPER_REGISTRY: "0xE16Df59B887e3Caa439E0b29B42bA2e7976FD8b2",
      },
    },
  },
}

export const abi = {
  dacAggregator: DACAggregatorAbi,
  dacProject: DACProjectAbi,
  dacContributorAccount: DACContributorAccountAbi,
}
