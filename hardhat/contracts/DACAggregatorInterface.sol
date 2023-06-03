// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

interface DACAggregatorInterface {
    struct Contribution {
        address projectContract;
        uint256 amountStored;
        uint256 amountDistributed;
        uint256 startedAt;
        uint256 endsAt;
    }

    struct ContributionMinimal {
        address projectContract;
        uint256 amount;
        uint256 index;
    }

    function isProjectActive(
        address _projectAddress
    ) external view returns (bool);

    function onContributionCreated(
        address _accountContract,
        Contribution memory _contribution
    ) external;

    function onContributionUpdated(
        address _accountContract,
        uint256 _index,
        Contribution memory _contribution
    ) external;

    function onContributionsTransfered(
        address _accountContract,
        ContributionMinimal[] memory _contributions
    ) external;

    function onAllContributionsCanceled(address _accountContract) external;
}
