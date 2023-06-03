// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

library DACContributorLibrary {
    /// @dev The status and infos of a contribution
    /// @param projectContract The address of the project contract
    /// @param amountStored The amount of the contribution stored in the account
    /// @param amountDistributed The amount of the contribution that was already sent to the project
    /// @param startedAt The timestamp when the contribution started
    /// @param endsAt The timestamp when the contribution ends
    struct Contribution {
        address projectContract;
        uint256 amountStored;
        uint256 amountDistributed;
        uint256 startedAt;
        uint256 endsAt;
    }

    /// @dev The minimal infos of a contribution to prepare the upkeep
    /// @param projectContract The address of the project contract
    /// @param amount The amount of the contribution that should be sent (based on the current date, start and end date)
    /// @param index The index of the contribution in the array of contributions
    struct ContributionMinimal {
        address projectContract;
        uint256 amount;
        uint256 index;
    }
}
