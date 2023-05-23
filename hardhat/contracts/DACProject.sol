// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

/**
 * @title DAC (Decentralized Autonomous Crowdfunding) Project
 * @author polarzero
 * @notice ...
 * @dev Note on the prefixes for variables: here we keep the `i_` prefix for some variables
 * that cannot be marked as immutable in Solidity. This means they are assigned only once in
 * the constructor, and won't/can't be changed afterwards.
 */

contract DACProject {
    /* -------------------------------------------------------------------------- */
    /*                                CUSTOM ERRORS                               */
    /* -------------------------------------------------------------------------- */

    /// @dev This function can only be called by the initiator of the project
    error DACProject__NOT_INITIATOR();
    /// @dev This function can only be called by the collaborators of the project
    error DACProject__NOT_COLLABORATOR();

    /* -------------------------------------------------------------------------- */
    /*                                   EVENTS                                   */
    /* -------------------------------------------------------------------------- */

    /* -------------------------------------------------------------------------- */
    /*                                   STORAGE                                  */
    /* -------------------------------------------------------------------------- */

    /**
     * @dev Initialized at contract creation and can't be changed afterwards
     */

    /// @dev The addresses of the collaborators (including the initiator)
    address[] private i_collaborators;
    /// @dev The address of the initiator of this project
    address private immutable i_initiator;
    /// @dev The interval between each payment in seconds
    uint256 private immutable i_paymentInterval;
    /// @dev The creation date of this project
    uint256 private immutable i_createdAt;
    /// @dev The name of the project
    string private i_name;
    /// @dev A short description of the project
    string private i_description;

    /// @dev The share of each collaborator
    mapping(address => uint256) private i_shares;

    /**
     * @dev Can be updated
     */

    /// @dev The state of this project
    /// One of the founders should manifest themselves at least once every 30 days
    /// Otherwise, the project will be considered as abandoned and the funds will be sent back to the contributors
    bool private s_active;

    /* -------------------------------------------------------------------------- */
    /*                                  MODIFIERS                                 */
    /* -------------------------------------------------------------------------- */

    /**
     * @notice Restricts the access to the initiator of the project
     */

    modifier onlyInitiator() {
        if (msg.sender != i_initiator) revert DACProject__NOT_INITIATOR();
        _;
    }

    /**
     * @notice Restricts the access to the collaborators of the project
     */

    modifier onlyCollaborators() {
        if (i_shares[msg.sender] == 0) revert DACProject__NOT_COLLABORATOR();
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
     * @param _paymentInterval The interval between each payment in seconds
     * @param _name The name of the project
     * @param _description A short description of the project
     * @dev All verifications have been done already in the factory contract, so we don't need to check them again
     * @dev This will register a new Chainlink Upkeep in the fly
     */
    constructor(
        address[] memory _collaborators,
        uint256[] memory _shares,
        address _initiator,
        uint256 _paymentInterval,
        string memory _name,
        string memory _description
    ) {
        // Initialize immutable variables
        i_collaborators = _collaborators;
        i_initiator = _initiator;
        i_paymentInterval = _paymentInterval;
        i_name = _name;
        i_description = _description;
        i_createdAt = block.timestamp;

        for (uint256 i = 0; i < _collaborators.length; i++) {
            i_shares[_collaborators[i]] = _shares[i];
        }

        // Initialize state variables
        s_active = true;

        // Register a new Chainlink Upkeep
    }

    /* -------------------------------------------------------------------------- */
    /*                                  FUNCTIONS                                 */
    /* -------------------------------------------------------------------------- */

    /* -------------------------------------------------------------------------- */
    /*                                   SETTERS                                  */
    /* -------------------------------------------------------------------------- */

    /* -------------------------------------------------------------------------- */
    /*                                   GETTERS                                  */
    /* -------------------------------------------------------------------------- */

    /**
     * @notice Get the addresses of the collaborators
     * @return array The addresses of the collaborators
     */

    function getCollaborators() external view returns (address[] memory) {
        return i_collaborators;
    }

    /**
     * @notice Get the shares of a specific collaborator
     * @param _collaborator The address of the collaborator
     * @return uint256 The share of the collaborator
     */

    function getShare(address _collaborator) external view returns (uint256) {
        return i_shares[_collaborator];
    }

    /**
     * @notice Get the initiator of the project
     * @return address The address of the initiator
     */

    function getInitiator() external view returns (address) {
        return i_initiator;
    }

    /**
     * @notice Get the interval between each payment in seconds
     * @return uint256 The interval between each payment in seconds
     */

    function getPaymentInterval() external view returns (uint256) {
        return i_paymentInterval;
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
        return i_name;
    }

    /**
     * @notice Get the description of the project
     * @return string The description of the project
     */

    function getDescription() external view returns (string memory) {
        return i_description;
    }

    /**
     * @notice Get the state of the project
     * @return bool The state of the project
     */

    function isActive() external view returns (bool) {
        return s_active;
    }
}
