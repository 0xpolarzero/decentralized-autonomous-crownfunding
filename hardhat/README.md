## Functions (factory)

🎯 Create a contributor account with an upkeep that will send contributions to projects once a week

- create an account and keep the address of the owner + the address of the contributor contract in a mapping (minimum link initial funding amount)
- don't allow to create multiple accounts for the same address

🎯 Submit a project

## Functions (contributor account)

🎯 deposit and withdraw link
🎯 check and perform upkeep

- check if there is enough for all contributions (separate function) if yes upkeep

🎯 check if enough for all contributions (to display in the ui)

🎯 contribute to a project (with funds and a timespan)

- emit an event so we know for the projects who is contributing and for how long/much
- call this contract to add it as a contributor (depending on whether we rely solely on events indexing or not)

🎯 cancel a contribution (and withdraw funds of this contribution)

- emit an event so we know for the projects who is contributing and for how long/much

🎯 trigger payments (from upkeep, but if not enough LINK can be called manually)

- need to calculate what need to be sent based on the total contribution, the time passed and the time left

## Functions (project)

need a way to know who is contributing

## UI

🎯 button on frontend to just send token to the contract (funding)

🎯 know if there is enough link for upkeeps based on the total contributions and expected price

    - isLastUpkeepSuccessful

🎯 On the projects page, display the next expected payments
