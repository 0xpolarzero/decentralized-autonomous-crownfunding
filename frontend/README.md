# Cascade - frontend

## Overview

The Next.js frontend for Cascade, available [here](https://cascade.polarzero.xyz). It uses [a Next.js starter template](https://ui.shadcn.com/docs/installation), [the amazing shadcs/ui components library](https://ui.shadcn.com/) and is deployed on [Vercel](https://vercel.com/).

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
   cd frontend
   ```
3. Install NPM packages using `yarn` or `npm install`.
4. Copy `.env.example` to `.env.local` and fill in the values.
   ```sh
   cp .env.example .env.local
   ```

### Usage

To run the application in development mode, use `yarn dev` or `npm run dev`.

To build the application for production, use:

```sh
yarn build
yarn next export
```

Everything else is already setup but can be replaced with your own configuration.

## License

Distributed under the MIT License. See `LICENSE` for more information.
