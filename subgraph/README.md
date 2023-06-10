# Cascade - subgraph

This folder contains everything related to the subgraph hosted on The Graph network. It indexes events emitted by the `DACAggregator` contract. Namely, it contains the following:

- `schema.graphql` - the GraphQL schema for the subgraph
- `subgraph.yaml` - the subgraph manifest
- `src` - the source code for the subgraph mappings

It indexes events each time:

- a project is submitted
- a project is pinged (meaning that a collaborator manifest themselves as active)
- a contributor account is created
- a contribution is created or updated
- the contributions are transfered to their respective project
- all contributions for the account are canceled

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
   cd subgraph
   ```
3. Install NPM packages using `yarn` or `npm install`.

### Usage

Generate types:

```sh
graph codegen
```

Build the subgraph:

```sh
graph build
```

Deploy the subgraph:

```sh
graph deploy <your_github_username>/<subgraph_name>
```

You will then need to choose either `hosted-service` or `studio` depending on the chain you want to deploy the subgraph to.

## License

Distributed under the MIT License. See `LICENSE.txt` for more information.
