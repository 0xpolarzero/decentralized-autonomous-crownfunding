# Cascade - hardhat

This folder contains all the smart contracts and the tests. Namely, it contains the following:

- `contracts/DACAggregator.sol`: The main contract used for creating projects and contributor accounts, which internally creates the corresponding contracts. It is indexed by the subgraph, and contains interface functions that are called by the `DACContributorAccount` contract on state changes.
- `contracts/DACContributorAccount.sol`: The contract used for managing a user's contributor account. It allows the user to create contributions to projects, update them, transfer payments, and manage their Chainlink Upkeep. It uses the Chainlink Automation system and therefore implements the `checkUpkeep` and `performUpkeep` functions.
- `contracts/DACProject.sol`: The contract used for managing a project. It is created with various data corresponding to the project, hold the funds received through contributions, and allows the project collaborators to withdraw them based on their share.

And their mock versions (`MockDACAggregator.sol` & `MockDACContributorAccount.sol`) since we're not truly interacting with the Chainlink registry & registrat during the upkeep tests on the hardhat local network.

## Trying out / testing

<p>To get a local copy up and running follow these simple example steps.</p>
<p>You will need to install either <strong>npm</strong> or <strong>yarn</strong> to run the commands, and <strong>git</strong> to clone the repository.</p>

### Installation

1. Clone the repo:
   ```sh
   git clone git@github.com:0xpolarzero/decentralized-autonomous-crownfunding.git
   ```
2. Navigate into this subdirectory:
   ```sh
   cd hardhat
   ```
3. Install NPM packages using `yarn` or `npm install`.
4. Create a `.env` file at the root, and populate it with the same variables as the `.env.example` file.

### Usage

Deploy:

```sh
yarn hardhat deploy
```

You can specify the network to deploy to with the `--network` flag, e.g. `yarn hardhat deploy --network mumbai`. You can use `mumbai`, `hardhat`, `localhost`. The latter will require you to run a local node first with the following command.

Run a local node:

```sh
yarn hardhat node
```

Run tests:

```sh
yarn hardhat test
# you can add the --network flag to run the tests on a specific network
# e.g. yarn hardhat test --network mumbai to run staging tests
# ! these are not yet implemented
```

Report coverage:

```sh
yarn hardhat coverage
# same as above, you can add the --network flag
```

`yarn hardhat coverage` will report the coverage of the unit tests. The staging tests are not included in the coverage report. This is why it will be critical for `DACAggregator` & `DACContributorAccount`, the same way as for their Mock versions while running `yarn hardhat coverage --network mumbai`.

To get the gas usage report included or not, change `enabled` to `true` or `false` in the hardhat.config.js file.

```properties
gasReporter: {
    enabled: true,
}
```

## License

Distributed under the MIT License. See `LICENSE` for more information.
