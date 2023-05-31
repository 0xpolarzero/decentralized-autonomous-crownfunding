# decentralized-autonomous-crownfunding on Arbitrum

## Process

Submit a founders team for a decentralized autonomous crowdfunding process.

Once the team (addresses) is submitted, create a child smart contract for this process (maybe link addresses with names, but doesn't need to be onchain, e.g. see Space & Time?).

Anyone investing some money is given access to proposals. There can be a timed period and/or a hardcap for the crowdfunding to finish.

See Chainlink Automations for this (upkeep on end of crowdfunding, same for proposals to be executed).

When the period is over/hardcap reached, each person is given a % based on the money they invested, which will determine their voting power.
If the (softcap?) is not reached, the founder can just dissolve the contract and the money is returned to the investors.

Then, maybe another time frame, anyone can propose a plan, like for each address, how much they are getting paid total/each month, so for each a % or the total pool and a time period. The founding team could come up with the first proposal.

Once all proposals are here, the voting starts. Each person can vote for any proposal, with their voting power. The proposal with the most votes wins. If there is a tie, the proposal with the most money invested wins.

Once this is finished, it's executed. The founders will be able to withdraw x amount of money per month (or maybe just based on the timestamp, calculated on the fly, so they can withdraw at any time but in the end they would have withdrawn no more than their allowance).

The thing is, anyone can submit a proposal for stopping the process, in case the founders rug or fail to deliver. If it reached a x % of votes (maybe it can be determined in the first proposal for the plan), the process is stopped and the rest of the money is returned to the investors based on their % invested. Withdrawing is disabled during the voting period.

DON'T VOTE TO STOP THE PROCESS AND REFUND: Just allow people to withdraw what's remaining of their investment, to stop supporting the project.

Use SPACE AND TIME to get indexed events of the child contracts

Founder need to check active at least once a month, otherwise the process is stopped and the money is returned to the investors.

UPKEEPS: perform upkeeps for these tasks

- daily on factory contract, check LINK balance of child contracts and fund them if they are active
- every 7 days

OR

on each upkeep:

- if the project is still active and has a balance, trigger the payment
- check the last time collaborators manifested themselves, if > 30 days set it no inactive

## UI

Need to catch everything to display on the website, also gathering all addresses that are in founding teams or investors, to allow for researching a profile. Maybe a backend (not necessarily decentralized) can allow people to link their profiles, e.g. Lens.

No need to do too big, e.g. function to create a project, no need for adding addresses after, modifying the name, etc etc. Keep it simple

- Create a project (with co-founders/team) with addresses, which creates a new smart contract ; also with the initial plan (hardcap, time frame, % for each address, % needed to stop the process)
- See in which projects you're involved
- During plan time, propose a plan
- After plan time, vote for a plan (display the most voted first)
- If a plan is executed, see the money you can withdraw (for founders)
- When executed, button to propose to halt the process (if you're an investor or a founder)

BUT hard to track events in these child contracts, still this issue
