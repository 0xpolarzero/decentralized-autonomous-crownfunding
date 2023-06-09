export const DACContributorAccountAbi = [
  {
    "type": "constructor",
    "payable": false,
    "inputs": [
      {
        "type": "address",
        "name": "_owner"
      },
      {
        "type": "address",
        "name": "_linkToken"
      },
      {
        "type": "address",
        "name": "_registrar"
      },
      {
        "type": "address",
        "name": "_registry"
      },
      {
        "type": "uint256",
        "name": "_paymentInterval"
      },
      {
        "type": "uint256",
        "name": "_maxContributions"
      },
      {
        "type": "uint32",
        "name": "_upkeepGasLimit"
      }
    ]
  },
  {
    "type": "error",
    "name": "DACContributorAccount__CALL_FAILED",
    "inputs": []
  },
  {
    "type": "error",
    "name": "DACContributorAccount__CONTRIBUTION_ALREADY_DISTRIBUTED",
    "inputs": []
  },
  {
    "type": "error",
    "name": "DACContributorAccount__FUNDING_AMOUNT_TOO_LOW",
    "inputs": []
  },
  {
    "type": "error",
    "name": "DACContributorAccount__INCORRECT_AMOUNT",
    "inputs": []
  },
  {
    "type": "error",
    "name": "DACContributorAccount__INVALID_TIMESTAMP",
    "inputs": []
  },
  {
    "type": "error",
    "name": "DACContributorAccount__INVALID_UPKEEP_INTERVAL",
    "inputs": []
  },
  {
    "type": "error",
    "name": "DACContributorAccount__NOT_OWNER",
    "inputs": []
  },
  {
    "type": "error",
    "name": "DACContributorAccount__NO_CONTRIBUTION_TO_SEND",
    "inputs": []
  },
  {
    "type": "error",
    "name": "DACContributorAccount__PROJECT_NOT_ACTIVE",
    "inputs": []
  },
  {
    "type": "error",
    "name": "DACContributorAccount__TOO_MANY_CONTRIBUTIONS",
    "inputs": []
  },
  {
    "type": "error",
    "name": "DACContributorAccount__TRANSFER_FAILED",
    "inputs": []
  },
  {
    "type": "error",
    "name": "DACContributorAccount__UPKEEP_ALREADY_REGISTERED",
    "inputs": []
  },
  {
    "type": "error",
    "name": "DACContributorAccount__UPKEEP_NOT_REGISTERED",
    "inputs": []
  },
  {
    "type": "error",
    "name": "DACContributorAccount__UPKEEP_REGISTRATION_FAILED",
    "inputs": []
  },
  {
    "type": "event",
    "anonymous": false,
    "name": "DACContributorAccount__AllContributionsCanceled",
    "inputs": [
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
      },
      {
        "type": "uint256",
        "name": "amount",
        "indexed": false
      }
    ]
  },
  {
    "type": "event",
    "anonymous": false,
    "name": "DACContributorAccount__ContributionCanceled",
    "inputs": [
      {
        "type": "address",
        "name": "projectContract",
        "indexed": true
      },
      {
        "type": "uint256",
        "name": "amount",
        "indexed": false
      }
    ]
  },
  {
    "type": "event",
    "anonymous": false,
    "name": "DACContributorAccount__ContributionCreated",
    "inputs": [
      {
        "type": "address",
        "name": "projectContract",
        "indexed": true
      },
      {
        "type": "uint256",
        "name": "amount",
        "indexed": false
      },
      {
        "type": "uint256",
        "name": "endDate",
        "indexed": false
      }
    ]
  },
  {
    "type": "event",
    "anonymous": false,
    "name": "DACContributorAccount__ContributionUpdated",
    "inputs": [
      {
        "type": "address",
        "name": "projectContract",
        "indexed": true
      },
      {
        "type": "uint256",
        "name": "amount",
        "indexed": false
      }
    ]
  },
  {
    "type": "event",
    "anonymous": false,
    "name": "DACContributorAccount__ContributionsTransfered",
    "inputs": [
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
    "name": "DACContributorAccount__UpkeepCanceled",
    "inputs": [
      {
        "type": "uint256",
        "name": "upkeepId",
        "indexed": false
      }
    ]
  },
  {
    "type": "event",
    "anonymous": false,
    "name": "DACContributorAccount__UpkeepFundsWithdrawn",
    "inputs": [
      {
        "type": "uint256",
        "name": "upkeepId",
        "indexed": false
      }
    ]
  },
  {
    "type": "event",
    "anonymous": false,
    "name": "DACContributorAccount__UpkeepIntervalUpdated",
    "inputs": [
      {
        "type": "uint256",
        "name": "interval",
        "indexed": false
      }
    ]
  },
  {
    "type": "event",
    "anonymous": false,
    "name": "DACContributorAccount__UpkeepRegistered",
    "inputs": [
      {
        "type": "uint256",
        "name": "upkeepId",
        "indexed": false
      },
      {
        "type": "uint256",
        "name": "interval",
        "indexed": false
      }
    ]
  },
  {
    "type": "function",
    "name": "cancelAllContributions",
    "constant": false,
    "payable": false,
    "inputs": [],
    "outputs": []
  },
  {
    "type": "function",
    "name": "cancelUpkeep",
    "constant": false,
    "payable": false,
    "inputs": [],
    "outputs": []
  },
  {
    "type": "function",
    "name": "checkUpkeep",
    "constant": true,
    "stateMutability": "view",
    "payable": false,
    "inputs": [
      {
        "type": "bytes"
      }
    ],
    "outputs": [
      {
        "type": "bool"
      },
      {
        "type": "bytes"
      }
    ]
  },
  {
    "type": "function",
    "name": "createContribution",
    "constant": false,
    "stateMutability": "payable",
    "payable": true,
    "inputs": [
      {
        "type": "address",
        "name": "_projectContract"
      },
      {
        "type": "uint256",
        "name": "_amount"
      },
      {
        "type": "uint256",
        "name": "_endDate"
      }
    ],
    "outputs": []
  },
  {
    "type": "function",
    "name": "getContributions",
    "constant": true,
    "stateMutability": "view",
    "payable": false,
    "inputs": [],
    "outputs": [
      {
        "type": "tuple[]",
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
    "type": "function",
    "name": "getCreatedAt",
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
    "name": "getDACAggregator",
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
    "name": "getLastUpkeep",
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
    "name": "getLink",
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
    "name": "getUpkeep",
    "constant": true,
    "stateMutability": "view",
    "payable": false,
    "inputs": [],
    "outputs": [
      {
        "type": "tuple",
        "components": [
          {
            "type": "address",
            "name": "target"
          },
          {
            "type": "uint32",
            "name": "executeGas"
          },
          {
            "type": "bytes",
            "name": "checkData"
          },
          {
            "type": "uint96",
            "name": "balance"
          },
          {
            "type": "address",
            "name": "admin"
          },
          {
            "type": "uint64",
            "name": "maxValidBlocknumber"
          },
          {
            "type": "uint32",
            "name": "lastPerformBlockNumber"
          },
          {
            "type": "uint96",
            "name": "amountSpent"
          },
          {
            "type": "bool",
            "name": "paused"
          },
          {
            "type": "bytes",
            "name": "offchainConfig"
          }
        ]
      }
    ]
  },
  {
    "type": "function",
    "name": "getUpkeepId",
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
    "name": "getUpkeepInterval",
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
    "name": "getUpkeepRegistrar",
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
    "name": "getUpkeepRegistry",
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
    "name": "performUpkeep",
    "constant": false,
    "payable": false,
    "inputs": [
      {
        "type": "bytes",
        "name": "performData"
      }
    ],
    "outputs": []
  },
  {
    "type": "function",
    "name": "registerNewUpkeep",
    "constant": false,
    "payable": false,
    "inputs": [
      {
        "type": "uint96",
        "name": "_fundingAmount"
      }
    ],
    "outputs": []
  },
  {
    "type": "function",
    "name": "setUpkeepInterval",
    "constant": false,
    "payable": false,
    "inputs": [
      {
        "type": "uint256",
        "name": "_interval"
      }
    ],
    "outputs": []
  },
  {
    "type": "function",
    "name": "triggerManualPayment",
    "constant": false,
    "payable": false,
    "inputs": [],
    "outputs": []
  },
  {
    "type": "function",
    "name": "updateContribution",
    "constant": false,
    "stateMutability": "payable",
    "payable": true,
    "inputs": [
      {
        "type": "uint256",
        "name": "_index"
      },
      {
        "type": "uint256",
        "name": "_amount"
      }
    ],
    "outputs": []
  },
  {
    "type": "function",
    "name": "withdrawUpkeepFunds",
    "constant": false,
    "payable": false,
    "inputs": [],
    "outputs": []
  }
] as const