import { ApolloClient, InMemoryCache } from "@apollo/client"

export const client = new ApolloClient({
  uri: process.env.SUBGRAPH_ENDPOINT,
  cache: new InMemoryCache(),
})
