import { gql } from "@apollo/client"

export const GET_PROJECTS = gql`
  query GetProjects($amountPerPage: Int!, $skip: Int!) {
    projects(first: $amountPerPage, skip: $skip) {
      id
      name
      description
      links
      tags
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

export const GET_CONTRIBUTOR_ACCOUNT = gql`
  query GetContributorAccount($address: String!) {
    contributorAccounts(where: { owner: $address }) {
      id
      owner
      createdAt
      contributions {
        id
        project
        amountStored
        amountDistributed
        startedAt
        endsAt
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
      links
      tags
      createdAt
      lastActivityAt
      projectContract
      initiator
      collaborators
      shares
      contributors {
        id
        account
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
      links
      tags
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

export const GET_PROJECT_BY_SLUG_CONTRACT = gql`
  query GetProjectBySlug($slug: String!) {
    projects(where: { projectContract: $slug }) {
      id
      name
      description
      links
      tags
      createdAt
      lastActivityAt
      projectContract
      initiator
      collaborators
      shares
      totalRaised
      contributors {
        id
        account {
          id
          owner
          accountContract
        }
        amountStored
        amountDistributed
        startedAt
        endsAt
      }
    }
  }
`
export const GET_PROJECT_BY_SLUG_NAME = gql`
  query GetProjectBySlug($slug: String!) {
    projects(where: { name_contains_nocase: $slug }) {
      id
      name
      description
      links
      tags
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
