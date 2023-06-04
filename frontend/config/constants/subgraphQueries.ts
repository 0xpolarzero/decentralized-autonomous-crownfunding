import { gql } from "@apollo/client"

export const GET_PROJECTS = gql`
  query GetProjects($amountPerPage: Int!, $skip: Int!) {
    projects(first: $amountPerPage, skip: $skip) {
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

export const GET_PROJECT_BY_SLUG = gql`
  query GetProjectBySlug($slug: String!) {
    projects(
      where: {
        OR: [
          { name_contains: $slug }
          { projectContract: $slug }
          { collaborators_contains: $slug }
        ]
      }
    ) {
      id
      name
      description
      createdAt
      lastActivityAt
      projectContract
      initiator
      collaborators
      shares
      totalRaised
    }
  }
`
