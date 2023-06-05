export const DACAggregatorAbi = [
  {
    "type": "constructor",
    "payable": false,
    "inputs": [
      {
        "type": "address",
        "name": "_linkTokenAddress"
      },
      {
        "type": "address",
        "name": "_keeperRegistrarAddress"
      },
      {
        "type": "address",
        "name": "_keeperRegistryAddress"
      },
      {
        "type": "uint256",
        "name": "_maxContributions"
      },
      {
        "type": "uint256",
        "name": "_nativeTokenLinkRate"
      },
      {
        "type": "uint32",
        "name": "_premiumPercent"
      },
      {
        "type": "uint32",
        "name": "_upkeepGasLimit"
      }
    ]
  },
  {
    "type": "error",
    "name": "DACAggregator__ALREADY_EXISTS",
    "inputs": []
  },
  {
    "type": "error",
    "name": "DACAggregator__DOES_NOT_EXIST",
    "inputs": []
  },
  {
    "type": "error",
    "name": "DACAggregator__DOES_NOT_INCLUDE_INITIATOR",
    "inputs": []
  },
  {
    "type": "error",
    "name": "DACAggregator__INVALID_LENGTH",
    "inputs": []
  },
  {
    "type": "error",
    "name": "DACAggregator__INVALID_NAME",
    "inputs": []
  },
  {
    "type": "error",
    "name": "DACAggregator__INVALID_PAYMENT_INTERVAL",
    "inputs": []
  },
  {
    "type": "error",
    "name": "DACAggregator__INVALID_SHARES",
    "inputs": []
  },
  {
    "type": "error",
    "name": "DACAggregator__NOT_COLLABORATOR",
    "inputs": []
  },
  {
    "type": "error",
    "name": "DACAggregator__NOT_CONTRIBUTOR_ACCOUNT",
    "inputs": []
  },
  {
    "type": "error",
    "name": "DACAggregator__NOT_OWNER",
    "inputs": []
  },
  {
    "type": "error",
    "name": "DACAggregator__TRANSFER_FAILED",
    "inputs": []
  },
  {
    "type": "event",
    "anonymous": false,
    "name": "DACAggregator__AllContributionsCanceled",
    "inputs": [
      {
        "type": "address",
        "name": "accountContract",
        "indexed": false
      }
    ]
  },
  {
    "type": "event",
    "anonymous": false,
    "name": "DACAggregator__ContributionCreated",
    "inputs": [
      {
        "type": "address",
        "name": "accountContract",
        "indexed": false
      },
      {
        "type": "tuple",
        "name": "contribution",
        "indexed": false,
        "components": [
          {
            "type": "address",
            "name": "projectContract"
          },
          {
            "type": "uint256",
            "name": "amountStored"
          },
          {
            "type": "uint256",
            "name": "amountDistributed"
          },
          {
            "type": "uint256",
            "name": "startedAt"
          },
          {
            "type": "uint256",
            "name": "endsAt"
          }
        ]
      }
    ]
  },
  {
    "type": "event",
    "anonymous": false,
    "name": "DACAggregator__ContributionUpdated",
    "inputs": [
      {
        "type": "address",
        "name": "accountContract",
        "indexed": false
      },
      {
        "type": "tuple",
        "name": "contribution",
        "indexed": false,
        "components": [
          {
            "type": "address",
            "name": "projectContract"
          },
          {
            "type": "uint256",
            "name": "amount"
          },
          {
            "type": "uint256",
            "name": "index"
          }
        ]
      }
    ]
  },
  {
    "type": "event",
    "anonymous": false,
    "name": "DACAggregator__ContributionsTransfered",
    "inputs": [
      {
        "type": "address",
        "name": "accountContract",
        "indexed": false
      },
      {
        "type": "tuple[]",
        "name": "contributions",
        "indexed": false,
        "components": [
          {
            "type": "address",
            "name": "projectContract"
          },
          {
            "type": "uint256",
            "name": "amount"
          },
          {
            "type": "uint256",
            "name": "index"
          }
        ]
      }
    ]
  },
  {
    "type": "event",
    "anonymous": false,
    "name": "DACAggregator__ContributorAccountCreated",
    "inputs": [
      {
        "type": "address",
        "name": "owner",
        "indexed": false
      },
      {
        "type": "address",
        "name": "contributorAccountContract",
        "indexed": false
      }
    ]
  },
  {
    "type": "event",
    "anonymous": false,
    "name": "DACAggregator__MaxContributionsUpdated",
    "inputs": [
      {
        "type": "uint256",
        "name": "maxContributions",
        "indexed": false
      }
    ]
  },
  {
    "type": "event",
    "anonymous": false,
    "name": "DACAggregator__NativeTokenLinkRateUpdated",
    "inputs": [
      {
        "type": "uint256",
        "name": "nativeTokenLinkRate",
        "indexed": false
      }
    ]
  },
  {
    "type": "event",
    "anonymous": false,
    "name": "DACAggregator__PremiumPercentUpdated",
    "inputs": [
      {
        "type": "uint256",
        "name": "premiumPercent",
        "indexed": false
      }
    ]
  },
  {
    "type": "event",
    "anonymous": false,
    "name": "DACAggregator__ProjectPinged",
    "inputs": [
      {
        "type": "address",
        "name": "projectAddress",
        "indexed": false
      },
      {
        "type": "address",
        "name": "collaborator",
        "indexed": false
      }
    ]
  },
  {
    "type": "event",
    "anonymous": false,
    "name": "DACAggregator__ProjectSubmitted",
    "inputs": [
      {
        "type": "tuple",
        "name": "project",
        "indexed": false,
        "components": [
          {
            "type": "address[]",
            "name": "collaborators"
          },
          {
            "type": "uint256[]",
            "name": "shares"
          },
          {
            "type": "address",
            "name": "projectContract"
          },
          {
            "type": "address",
            "name": "initiator"
          },
          {
            "type": "uint256",
            "name": "createdAt"
          },
          {
            "type": "uint256",
            "name": "lastActivityAt"
          },
          {
            "type": "string",
            "name": "name"
          },
          {
            "type": "string",
            "name": "description"
          },
          {
            "type": "string",
            "name": "links"
          },
          {
            "type": "string",
            "name": "tags"
          }
        ]
      }
    ]
  },
  {
    "type": "event",
    "anonymous": false,
    "name": "DACAggregator__UpkeepGasLimitUpdated",
    "inputs": [
      {
        "type": "uint32",
        "name": "upkeepGasLimit",
        "indexed": false
      }
    ]
  },
  {
    "type": "function",
    "name": "createContributorAccount",
    "constant": false,
    "payable": false,
    "inputs": [
      {
        "type": "uint256",
        "name": "_paymentInterval"
      }
    ],
    "outputs": []
  },
  {
    "type": "function",
    "name": "getContributorAccount",
    "constant": true,
    "stateMutability": "view",
    "payable": false,
    "inputs": [
      {
        "type": "address",
        "name": "_contributor"
      }
    ],
    "outputs": [
      {
        "type": "address"
      }
    ]
  },
  {
    "type": "function",
    "name": "getKeeperRegistrarAddress",
    "constant": true,
    "stateMutability": "view",
    "payable": false,
    "inputs": [],
    "outputs": [
      {
        "type": "address"
      }
    ]
  },
  {
    "type": "function",
    "name": "getKeeperRegistryAddress",
    "constant": true,
    "stateMutability": "view",
    "payable": false,
    "inputs": [],
    "outputs": [
      {
        "type": "address"
      }
    ]
  },
  {
    "type": "function",
    "name": "getLinkTokenAddress",
    "constant": true,
    "stateMutability": "view",
    "payable": false,
    "inputs": [],
    "outputs": [
      {
        "type": "address"
      }
    ]
  },
  {
    "type": "function",
    "name": "getMaxContributions",
    "constant": true,
    "stateMutability": "view",
    "payable": false,
    "inputs": [],
    "outputs": [
      {
        "type": "uint256"
      }
    ]
  },
  {
    "type": "function",
    "name": "getNativeTokenLinkRate",
    "constant": true,
    "stateMutability": "view",
    "payable": false,
    "inputs": [],
    "outputs": [
      {
        "type": "uint256"
      }
    ]
  },
  {
    "type": "function",
    "name": "getOwner",
    "constant": true,
    "stateMutability": "view",
    "payable": false,
    "inputs": [],
    "outputs": [
      {
        "type": "address"
      }
    ]
  },
  {
    "type": "function",
    "name": "getPremiumPercent",
    "constant": true,
    "stateMutability": "view",
    "payable": false,
    "inputs": [],
    "outputs": [
      {
        "type": "uint32"
      }
    ]
  },
  {
    "type": "function",
    "name": "getProject",
    "constant": true,
    "stateMutability": "view",
    "payable": false,
    "inputs": [
      {
        "type": "address",
        "name": "_projectAddress"
      }
    ],
    "outputs": [
      {
        "type": "tuple",
        "components": [
          {
            "type": "address[]",
            "name": "collaborators"
          },
          {
            "type": "uint256[]",
            "name": "shares"
          },
          {
            "type": "address",
            "name": "projectContract"
          },
          {
            "type": "address",
            "name": "initiator"
          },
          {
            "type": "uint256",
            "name": "createdAt"
          },
          {
            "type": "uint256",
            "name": "lastActivityAt"
          },
          {
            "type": "string",
            "name": "name"
          },
          {
            "type": "string",
            "name": "description"
          },
          {
            "type": "string",
            "name": "links"
          },
          {
            "type": "string",
            "name": "tags"
          }
        ]
      }
    ]
  },
  {
    "type": "function",
    "name": "getUpkeepGasLimit",
    "constant": true,
    "stateMutability": "view",
    "payable": false,
    "inputs": [],
    "outputs": [
      {
        "type": "uint32"
      }
    ]
  },
  {
    "type": "function",
    "name": "isProjectActive",
    "constant": true,
    "stateMutability": "view",
    "payable": false,
    "inputs": [
      {
        "type": "address",
        "name": "_projectAddress"
      }
    ],
    "outputs": [
      {
        "type": "bool"
      }
    ]
  },
  {
    "type": "function",
    "name": "onAllContributionsCanceled",
    "constant": false,
    "payable": false,
    "inputs": [
      {
        "type": "address",
        "name": "_accountContract"
      }
    ],
    "outputs": []
  },
  {
    "type": "function",
    "name": "onContributionCreated",
    "constant": false,
    "payable": false,
    "inputs": [
      {
        "type": "address",
        "name": "_accountContract"
      },
      {
        "type": "tuple",
        "name": "_contribution",
        "components": [
          {
            "type": "address",
            "name": "projectContract"
          },
          {
            "type": "uint256",
            "name": "amountStored"
          },
          {
            "type": "uint256",
            "name": "amountDistributed"
          },
          {
            "type": "uint256",
            "name": "startedAt"
          },
          {
            "type": "uint256",
            "name": "endsAt"
          }
        ]
      }
    ],
    "outputs": []
  },
  {
    "type": "function",
    "name": "onContributionUpdated",
    "constant": false,
    "payable": false,
    "inputs": [
      {
        "type": "address",
        "name": "_accountContract"
      },
      {
        "type": "tuple",
        "name": "_contribution",
        "components": [
          {
            "type": "address",
            "name": "projectContract"
          },
          {
            "type": "uint256",
            "name": "amount"
          },
          {
            "type": "uint256",
            "name": "index"
          }
        ]
      }
    ],
    "outputs": []
  },
  {
    "type": "function",
    "name": "onContributionsTransfered",
    "constant": false,
    "payable": false,
    "inputs": [
      {
        "type": "address",
        "name": "_accountContract"
      },
      {
        "type": "tuple[]",
        "name": "_contributions",
        "components": [
          {
            "type": "address",
            "name": "projectContract"
          },
          {
            "type": "uint256",
            "name": "amount"
          },
          {
            "type": "uint256",
            "name": "index"
          }
        ]
      }
    ],
    "outputs": []
  },
  {
    "type": "function",
    "name": "pingProject",
    "constant": false,
    "payable": false,
    "inputs": [
      {
        "type": "address",
        "name": "_projectAddress"
      }
    ],
    "outputs": []
  },
  {
    "type": "function",
    "name": "setMaxContributions",
    "constant": false,
    "payable": false,
    "inputs": [
      {
        "type": "uint256",
        "name": "_maxContributions"
      }
    ],
    "outputs": []
  },
  {
    "type": "function",
    "name": "setNativeTokenLinkRate",
    "constant": false,
    "payable": false,
    "inputs": [
      {
        "type": "uint256",
        "name": "_rate"
      }
    ],
    "outputs": []
  },
  {
    "type": "function",
    "name": "setPremiumPercent",
    "constant": false,
    "payable": false,
    "inputs": [
      {
        "type": "uint32",
        "name": "_premium"
      }
    ],
    "outputs": []
  },
  {
    "type": "function",
    "name": "setUpkeepGasLimit",
    "constant": false,
    "payable": false,
    "inputs": [
      {
        "type": "uint32",
        "name": "_gasLimit"
      }
    ],
    "outputs": []
  },
  {
    "type": "function",
    "name": "submitProject",
    "constant": false,
    "payable": false,
    "inputs": [
      {
        "type": "address[]",
        "name": "_collaborators"
      },
      {
        "type": "uint256[]",
        "name": "_shares"
      },
      {
        "type": "string",
        "name": "_name"
      },
      {
        "type": "string",
        "name": "_description"
      },
      {
        "type": "string",
        "name": "_links"
      },
      {
        "type": "string",
        "name": "_tags"
      }
    ],
    "outputs": []
  }
]