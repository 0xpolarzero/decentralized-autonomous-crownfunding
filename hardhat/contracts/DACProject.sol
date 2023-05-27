// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "hardhat/console.sol";

/**
 * @title DAC (Decentralized Autonomous Crowdfunding) Project
 * @author polarzero
 * @notice ...
 */

contract DACProject {
    /* -------------------------------------------------------------------------- */
    /*                                CUSTOM ERRORS                               */
    /* -------------------------------------------------------------------------- */

    /// @dev This function can only be called by a collaborator of the project
    error DACProject__NOT_COLLABORATOR();
    /// @dev The collaborator doesn't have enough funds available to withdraw
    error DACProject__NOT_ENOUGH_FUNDS_AVAILABLE();
    /// @dev The transfer of funds failed
    error DACProject__TRANSFER_FAILED();

    /* -------------------------------------------------------------------------- */
    /*                                   EVENTS                                   */
    /* -------------------------------------------------------------------------- */

    /// @dev Emitted when a new contribution is received
    /// @param contributor The address of the contributor
    /// @param amount The amount of funds received
    event DACProject__ReceivedContribution(
        address indexed contributor,
        uint256 amount
    );

    /// @dev Emitted when a collaborator withdraws their share
    /// @param collaborator The address of the collaborator
    /// @param amount The amount of funds withdrawn
    event DACProject__ShareWithdrawn(
        address indexed collaborator,
        uint256 amount
    );

    /* -------------------------------------------------------------------------- */
    /*                                   STORAGE                                  */
    /* -------------------------------------------------------------------------- */

    /**
     * @dev Main informations
     */

    // Won't be updated after the creation
    /// @dev The address of the initiator of this project
    address private immutable i_initiator;
    /// @dev The creation date of this project
    uint256 private immutable i_createdAt;
    /// @dev The name of the project
    string private s_name;
    /// @dev A short description of the project
    string private s_description;

    // Will be updated after each contribution
    /// @dev The amount of funds received from contributions
    uint256 private s_totalRaised;

    /**
     * @dev Contributors
     * @dev The addresses will either be individuals (if sending directly to the contract) or
     * contracts (if sending from a contributor account, or any other contract)
     */

    /// @dev The addresses of the contributors
    address[] private s_contributorsAddresses;

    /// @dev The amount of funds contributed by each contributor
    mapping(address => uint256) private s_contributors;

    /**
     * @dev Collaborators
     */

    // Collaborators
    /// @dev The addresses of the collaborators
    address[] private s_collaboratorsAddresses;

    /// @dev The status and infos of a collaborator
    /// @param shares The share of contributions of the collaborator
    /// @param amountAvailable The amount of funds available for the collaborator to withdraw
    struct Collaborator {
        uint256 share;
        uint256 amountAvailable;
    }

    /// @dev The status and infos of the collaborators (share & total withdrawn)
    mapping(address => Collaborator) private s_collaborators;

    /* -------------------------------------------------------------------------- */
    /*                                  MODIFIERS                                 */
    /* -------------------------------------------------------------------------- */

    /**
     * @notice Restricts the access to the collaborators of the project
     */

    modifier onlyCollaborator() {
        if (!isCollaborator(msg.sender)) revert DACProject__NOT_COLLABORATOR();
        _;
    }

    /* -------------------------------------------------------------------------- */
    /*                                 CONSTRUCTOR                                */
    /* -------------------------------------------------------------------------- */

    /**
     * @notice The constructor of the DAC aggregator contract
     * @param _collaborators The addresses of the collaborators (including the initiator)
     * @param _shares The shares of each collaborator (in the same order as the collaborators array)
     * @param _initiator The address of the initiator
     * @param _name The name of the project
     * @param _description A short description of the project
     * @dev All verifications have been done already in the factory contract, so we don't need to check them again
     * @dev This will register a new Chainlink Upkeep in the fly
     */
    constructor(
        address[] memory _collaborators,
        uint256[] memory _shares,
        address _initiator,
        string memory _name,
        string memory _description
    ) {
        // Initialize immutable variables
        i_initiator = _initiator;
        // (not marked immutable but can't be changed afterwards)
        s_name = _name;
        s_description = _description;
        i_createdAt = block.timestamp;

        // Initialize collaborators
        for (uint256 i = 0; i < _collaborators.length; i++) {
            // Add their address to the array
            s_collaboratorsAddresses.push(_collaborators[i]);
            // Initialize their share
            s_collaborators[_collaborators[i]] = Collaborator(_shares[i], 0);
        }
    }

    /* -------------------------------------------------------------------------- */
    /*                                  FUNCTIONS                                 */
    /* -------------------------------------------------------------------------- */

    /**
     * @notice Receive function, triggered when the contract receives funds
     */

    receive() external payable {
        onContributionReceived(msg.sender, msg.value);
    }

    /**
     * @notice Fallback function, triggered when the contract receives funds along with some data
     */

    fallback() external payable {
        onContributionReceived(msg.sender, msg.value);
    }

    /**
     * @notice Withdraw the funds available for the collaborator
     * @param _amount The amount of funds to withdraw
     * @dev This function can only be called by the collaborators of the project
     */

    function withdrawShare(uint256 _amount) external onlyCollaborator {
        // Get the amount available and withdrawn for the collaborator
        Collaborator memory collaborator = s_collaborators[msg.sender];

        // Check if the collaborator has enough funds available
        if (collaborator.amountAvailable < _amount)
            revert DACProject__NOT_ENOUGH_FUNDS_AVAILABLE();

        // Update the amount available
        unchecked {
            s_collaborators[msg.sender].amountAvailable -= _amount;
        }

        // Transfer the funds to the collaborator
        (bool success, ) = msg.sender.call{value: _amount}("");
        if (!success) revert DACProject__TRANSFER_FAILED();

        emit DACProject__ShareWithdrawn(msg.sender, _amount);
    }

    /**
     * @notice Called by `receive` or `fallback` when the contract receives funds
     * @param _contributor The address of the contributor (either an individual or a contract)
     * @param _amount The amount of funds received
     */

    function onContributionReceived(
        address _contributor,
        uint256 _amount
    ) private {
        // Update the total amount raised
        s_totalRaised += _amount;
        // Update the amount contributed by the contributor
        s_contributors[_contributor] += _amount;
        // Add the contributor to the array if they have never contributed before
        if (s_contributors[_contributor] == _amount)
            s_contributorsAddresses.push(_contributor);

        // Get the addresses of the collaborators
        address[] memory collaboratorsAddresses = s_collaboratorsAddresses;

        // Update the amount available for each collaborator
        for (uint256 i = 0; i < collaboratorsAddresses.length; ) {
            // Update the amount available for the collaborator
            s_collaborators[collaboratorsAddresses[i]].amountAvailable +=
                (_amount * s_collaborators[collaboratorsAddresses[i]].share) /
                100;

            unchecked {
                i++;
            }
        }

        emit DACProject__ReceivedContribution(msg.sender, msg.value);
    }

    /* -------------------------------------------------------------------------- */
    /*                                   GETTERS                                  */
    /* -------------------------------------------------------------------------- */

    /**
     * @notice Know if an address is a collaborator
     * @param _collaborator The address to check
     */

    function isCollaborator(address _collaborator) public view returns (bool) {
        for (uint256 i = 0; i < s_collaboratorsAddresses.length; i++) {
            if (s_collaboratorsAddresses[i] == _collaborator) return true;
        }
        return false;
    }

    /**
     * @notice Get the addresses of the collaborators
     * @return array The addresses of the collaborators
     */

    function getCollaboratorsAddresses()
        external
        view
        returns (address[] memory)
    {
        return s_collaboratorsAddresses;
    }

    /**
     * @notice Get the informations of a specific collaborator
     * @param _collaborator The address of the collaborator
     * @return struct The share of the collaborator and the total amount already withdrawn
     */

    function getCollaborator(
        address _collaborator
    ) external view returns (Collaborator memory) {
        return s_collaborators[_collaborator];
    }

    /**
     * @notice Get the addresses of the contributors
     * @return array The addresses of the contributors
     */

    function getContributorsAddresses()
        external
        view
        returns (address[] memory)
    {
        return s_contributorsAddresses;
    }

    /**
     * @notice Get the amount contributed by a specific contributor
     * @param _contributor The address of the contributor
     * @return uint256 The amount contributed
     */

    function getContributedAmount(
        address _contributor
    ) external view returns (uint256) {
        return s_contributors[_contributor];
    }

    /**
     * @notice Get the total amount raised
     * @return uint256 The total amount raised
     */

    function getTotalRaised() external view returns (uint256) {
        return s_totalRaised;
    }

    /**
     * @notice Get the total amount contributed by each contributor
     * @return array All the contributors
     * @return array All the amounts contributed (in the same order)
     */

    function getContributorsWithAmounts()
        external
        view
        returns (address[] memory, uint256[] memory)
    {
        // Get the addresses of the contributors
        address[] memory contributorsAddresses = s_contributorsAddresses;
        // Initialize the array of amounts
        uint256[] memory amounts = new uint256[](contributorsAddresses.length);

        // Get the amount contributed by each contributor
        for (uint256 i = 0; i < contributorsAddresses.length; ) {
            amounts[i] = s_contributors[contributorsAddresses[i]];

            unchecked {
                i++;
            }
        }

        return (contributorsAddresses, amounts);
    }

    /**
     * @notice Get the initiator of the project
     * @return address The address of the initiator
     */

    function getInitiator() external view returns (address) {
        return i_initiator;
    }

    /**
     * @notice Get the creation date of the project
     * @return uint256 The creation date of the project
     */

    function getCreatedAt() external view returns (uint256) {
        return i_createdAt;
    }

    /**
     * @notice Get the name of the project
     * @return string The name of the project
     */

    function getName() external view returns (string memory) {
        return s_name;
    }

    /**
     * @notice Get the description of the project
     * @return string The description of the project
     */

    function getDescription() external view returns (string memory) {
        return s_description;
    }
}
