"use client"

import React from "react"
import { ApolloProvider } from "@apollo/client"

import { client } from "@/config/apollo-client"

export function ApolloProviderWrapper({ children, ...props }: any) {
  return (
    <React.Fragment {...props}>
      <ApolloProvider client={client}>{children}</ApolloProvider>
    </React.Fragment>
  )
}
