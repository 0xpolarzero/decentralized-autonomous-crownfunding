// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

interface DACAggregatorInterface {
    function isProjectActive(
        address _projectAddress
    ) external view returns (bool);

    function calculateUpkeepPrice(
        uint32 _upkeepGasLimit
    ) external view returns (uint256);
}
