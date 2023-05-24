## Functions (factory)

- Create a contributor account with an upkeep that will send contributions to projects once a week

  - create an account and keep the address of the owner + the address of the contributor contract in a mapping
  - don't allow to create multiple accounts for the same address

- Submit a project

## Functions (contributor account)

- deposit and withdraw link
- check and perform upkeep

  - check if there is enough for all contributions (separate function) if yes upkeep

- check if enough for all contributions (to display in the ui)

- contribute to a project (with funds and a timespan)

  - emit an event so we know for the projects who is contributing and for how long/much

- cancel a contribution (and withdraw funds of this contribution)

  - emit an event so we know for the projects who is contributing and for how long/much

## Functions (project)

need a way to know who is contributing
