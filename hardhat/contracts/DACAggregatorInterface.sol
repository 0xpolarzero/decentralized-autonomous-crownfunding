// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "./DACContributionSystem.sol";

interface DACAggregatorInterface {
    function isProjectActive(
        address _projectAddress
    ) external view returns (bool);

    function onContributionCreated(
        address _sender,
        DACContributionSystem.Contribution memory _contribution
    ) external;

    function onContributionUpdated(
        address _sender,
        DACContributionSystem.ContributionMinimal memory _contribution
    ) external;

    function onContributionsTransfered(
        address _sender,
        DACContributionSystem.ContributionMinimal[] memory _contributions
    ) external;

    function onAllContributionsCanceled(address _sender) external;
}
