export const DACProjectAbi = [
  {
    type: "constructor",
    payable: false,
    inputs: [
      {
        type: "address[]",
        name: "_collaborators",
      },
      {
        type: "uint256[]",
        name: "_shares",
      },
      {
        type: "address",
        name: "_initiator",
      },
      {
        type: "string",
        name: "_name",
      },
      {
        type: "string",
        name: "_description",
      },
      {
        type: "string",
        name: "_urls",
      },
      {
        type: "string",
        name: "_tags",
      },
    ],
  },
  {
    type: "error",
    name: "DACProject__NOT_COLLABORATOR",
    inputs: [],
  },
  {
    type: "error",
    name: "DACProject__NOT_ENOUGH_FUNDS_AVAILABLE",
    inputs: [],
  },
  {
    type: "error",
    name: "DACProject__TRANSFER_FAILED",
    inputs: [],
  },
  {
    type: "event",
    anonymous: false,
    name: "DACProject__ReceivedContribution",
    inputs: [
      {
        type: "address",
        name: "contributor",
        indexed: true,
      },
      {
        type: "uint256",
        name: "amount",
        indexed: false,
      },
    ],
  },
  {
    type: "event",
    anonymous: false,
    name: "DACProject__ShareWithdrawn",
    inputs: [
      {
        type: "address",
        name: "collaborator",
        indexed: true,
      },
      {
        type: "uint256",
        name: "amount",
        indexed: false,
      },
    ],
  },
  {
    type: "function",
    name: "getCollaborator",
    constant: true,
    stateMutability: "view",
    payable: false,
    inputs: [
      {
        type: "address",
        name: "_collaborator",
      },
    ],
    outputs: [
      {
        type: "tuple",
        components: [
          {
            type: "uint256",
            name: "share",
          },
          {
            type: "uint256",
            name: "amountAvailable",
          },
        ],
      },
    ],
  },
  {
    type: "function",
    name: "getCollaboratorsAddresses",
    constant: true,
    stateMutability: "view",
    payable: false,
    inputs: [],
    outputs: [
      {
        type: "address[]",
      },
    ],
  },
  {
    type: "function",
    name: "getContributedAmount",
    constant: true,
    stateMutability: "view",
    payable: false,
    inputs: [
      {
        type: "address",
        name: "_contributor",
      },
    ],
    outputs: [
      {
        type: "uint256",
      },
    ],
  },
  {
    type: "function",
    name: "getContributorsAddresses",
    constant: true,
    stateMutability: "view",
    payable: false,
    inputs: [],
    outputs: [
      {
        type: "address[]",
      },
    ],
  },
  {
    type: "function",
    name: "getContributorsWithAmounts",
    constant: true,
    stateMutability: "view",
    payable: false,
    inputs: [],
    outputs: [
      {
        type: "address[]",
      },
      {
        type: "uint256[]",
      },
    ],
  },
  {
    type: "function",
    name: "getCreatedAt",
    constant: true,
    stateMutability: "view",
    payable: false,
    inputs: [],
    outputs: [
      {
        type: "uint256",
      },
    ],
  },
  {
    type: "function",
    name: "getDescription",
    constant: true,
    stateMutability: "view",
    payable: false,
    inputs: [],
    outputs: [
      {
        type: "string",
      },
    ],
  },
  {
    type: "function",
    name: "getInitiator",
    constant: true,
    stateMutability: "view",
    payable: false,
    inputs: [],
    outputs: [
      {
        type: "address",
      },
    ],
  },
  {
    type: "function",
    name: "getName",
    constant: true,
    stateMutability: "view",
    payable: false,
    inputs: [],
    outputs: [
      {
        type: "string",
      },
    ],
  },
  {
    type: "function",
    name: "getTags",
    constant: true,
    stateMutability: "view",
    payable: false,
    inputs: [],
    outputs: [
      {
        type: "string",
      },
    ],
  },
  {
    type: "function",
    name: "getTotalRaised",
    constant: true,
    stateMutability: "view",
    payable: false,
    inputs: [],
    outputs: [
      {
        type: "uint256",
      },
    ],
  },
  {
    type: "function",
    name: "getUrls",
    constant: true,
    stateMutability: "view",
    payable: false,
    inputs: [],
    outputs: [
      {
        type: "string",
      },
    ],
  },
  {
    type: "function",
    name: "isCollaborator",
    constant: true,
    stateMutability: "view",
    payable: false,
    inputs: [
      {
        type: "address",
        name: "_collaborator",
      },
    ],
    outputs: [
      {
        type: "bool",
      },
    ],
  },
  {
    type: "function",
    name: "withdrawShare",
    constant: false,
    payable: false,
    inputs: [
      {
        type: "uint256",
        name: "_amount",
      },
    ],
    outputs: [],
  },
] as const
