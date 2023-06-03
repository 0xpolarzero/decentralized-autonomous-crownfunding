import { gql } from "@apollo/client"

export const GET_PROJECTS = gql`
  query GetProjects($pageNumber: Int!, $amountPerPage: Int!) {
    projects(first: $amountPerPage, skip: $pageNumber * $amountPerPage) {
      id
      name
      description
      createdAt
      lastActivityAt
      projectContract
      initiator
      collaborators
      shares
      contributors {
        id
      }
      totalRaised
    }
  }
`

export const GET_CONTRIBUTOR_ACCOUNT = gql`
  query GetContributorAccount($address: String!) {
    contributorAccounts(where: { owner: $address }) {
      id
      owner
      createdAt
      contributions {
        id
      }
      totalContributed
    }
  }
`

export const GET_CONTRIBUTIONS_FOR_PROJECT = gql`
  query GetContributionsForProject($address: String!) {
    projects(where: { projectContract: $address }) {
      id
      name
      description
      createdAt
      lastActivityAt
      projectContract
      initiator
      collaborators
      shares
      contributors {
        id
        accountContract
        projectContract
        amountStored
        amountDistributed
        startedAt
        endsAt
      }
      totalRaised
    }
  }
`

export const GET_PROJECTS_FOR_USER = gql`
  query GetProjectsForUser($address: String!) {
    projects(where: { initiator: $address }) {
      id
      name
      description
      createdAt
      lastActivityAt
      projectContract
      initiator
      collaborators
      shares
      contributors {
        id
      }
      totalRaised
    }
  }
`
