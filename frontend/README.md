[ ] Add footer with shadcn ui link

# Home page

Description

Explore projects

# Projects page

## Search bar to search projects based on name, description, collaborators addresses or project address

## Table with projects

- name
- creation date
- last time a collaborator manifested themselves (popover to explain)
- collaborators addresses
- total amount raised
- amount of current contributors + expected weekly payout

[ ] click to show more info (description, collaborators shares, contributors addresses, amount contributed & address)
[ ] click to contribute (greyed out if not connected + popover to explain that) -> opens modal
-> amount to contribute
-> end date of contribution

# Contributor account page

## greyed out if not connected, tells user to connect first

## if connected

### Summary

- total amount in contributor contract
- total amount contributed
- status of upkeep (not registered, not enough funds, active) & manage automated payments button -> opens modal
  -> gives approximate recommended amount to fund upkeep
  -> if not registered, register upkeep (first send LINK to contract, then register if contract has a balance of LINK)
  -> if registered, show balance, button to fund upkeep with specific amount, button to cancel upkeep, button to withdraw funds (50 blocks after canceling upkeep)
  [ ] button to cancel all contributions

### Current contributions

Tables with current contributions

- project name
- still active or not (last activity, popover to explain)
- amount contributed
- amount yet to distribute
- start date of contribution
- end date of contribution
- expected next payout date & amount
  [ ] click to show more info (description, collaborators shares, contributors addresses, amount contributed & address)
  [ ] click to update contribution -> opens modal
  -> say current amount left to contribute and let user change it with minimum amount
  [ ] click to cancel contribution

### Past contributions

Tables with past contributions

- project name
- amount contributed
- period of contribution
  [ ] click to show more info (description, collaborators shares, contributors addresses, amount contributed & address)
  [ ] click to contribute again -> opens modal
  -> amount to contribute
  -> end date of contribution
