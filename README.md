# Cascade - A decentralized automated crowdfunding platform

Your decentralized crowdfunding platform. Enabling automated and flexible project support through blockchain and Chainlink.

Cascade is a crowdfunding platform that tries to enable a new level of control and flexibility in supporting projects you believe in. Leveraging Chainlink Automation, Cascade ensures precise, periodic payments to chosen projects, embodying the continuous flow its name suggests. Instead of dealing with recurring bank deductions, you dedicate an amount of your choice from your contributor account, for each project. These funds are then automatically distributed at intervals you specify.

As the member of a project, you can stay confident that each collaborator is being paid their fair share, without having to worry about the logistics of the process.

## Overview

It is a platform for both projects support and creation. It behaves as **an interface between founders and contributors**, where the latter can plan their contributions over a specified period, give out their funds to a secured contract, let the payments be sent automatically, and still pull back if they don't feel confident anymore at some point.

The collaborators in a project are each assigned a percentage of the funds, and are able to withdraw their share at any time.

## Directory structure

### `frontend`

Everything related to the Next.js app, which is the main interface of the platform, written in Typescript. It can be visited at [cascade.polarzero.xyz](https://cascade.polarzero.xyz).

### `hardhat`

The smart contracts, written in Solidity and both tested and deployed with Hardhat. The contracts are currently deployed on the Polygon Mumbai testnet.

### `subgraph`

The subgraph, written in Typescript & GraphQL, which is used to index the events emitted by the smart contracts. It is deployed on [The Graph's studio](https://thegraph.com).

## Trying out / testing

To get a local copy up and running follow these simple example steps.

You will need to install either **npm** or **yarn** to run the commands, and **git** to clone the repository.

### Installation

1. Clone the repo:

   ```sh
   git clone https://github.com/0xpolarzero/chainlink-fall-2022-hackathon
   ```

2. Navigate into a subdirectory:

   ```sh
   cd name-of-the-subdirectory
   ```

3. Install NPM packages using `yarn` or `npm install`.

### Usage

Usage strongly depends on the subdirectory you are in. Please refer to the `README.md` file in each subdirectory for more information.

## License

Distributed under the MIT License. See `LICENSE` for more information.

## Contact

If you have any questions, feel free to reach out to me on [Twitter](https://twitter.com/0xpolarzero) or [by email](mailto:0xpolarzero@gmail.com) (0xpolarzero@gmail.com).
