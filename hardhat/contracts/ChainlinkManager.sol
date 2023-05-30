// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@chainlink/contracts/src/v0.8/interfaces/LinkTokenInterface.sol";
import "@chainlink/contracts/src/v0.8/AutomationCompatible.sol";

/// @dev Used for registering an Upkeep
struct RegistrationParams {
    string name;
    bytes encryptedEmail;
    address upkeepContract;
    uint32 gasLimit;
    address adminAddress;
    bytes checkData;
    bytes offchainConfig;
    uint96 amount;
}
/// @dev Used for transmitting information about a specific Upkeep
struct UpkeepInfo {
    address target;
    uint32 executeGas;
    bytes checkData;
    uint96 balance;
    address admin;
    uint64 maxValidBlocknumber;
    uint32 lastPerformBlockNumber;
    uint96 amountSpent;
    bool paused;
    bytes offchainConfig;
}

interface KeeperRegistrarInterface {
    function registerUpkeep(
        RegistrationParams calldata requestParams
    ) external returns (uint256);
}

interface KeeperRegistryInterface {
    function addFunds(uint256 id, uint96 amount) external;

    function withdrawFunds(uint256 id, address to) external;

    function cancelUpkeep(uint256 id) external;

    function getUpkeep(
        uint256 id
    ) external view returns (UpkeepInfo memory upkeepInfo);
}
