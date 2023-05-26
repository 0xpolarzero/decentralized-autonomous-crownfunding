// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

/**
 * @title DAC (Decentralized Autonomous Crowdfunding) Project
 * @author polarzero
 * @notice ...
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

    /// @dev The address of the initiator of this project
    address private immutable i_initiator;
    /// @dev The creation date of this project
    uint256 private immutable i_createdAt;
    /// @dev The name of the project
    string private s_name;
    /// @dev A short description of the project
    string private s_description;

    /**
     * @dev Can be updated
     */

    /// @dev The last time a collaborator has manifested themselves
    uint256 private s_lastCollaboratorCheckTimestamp;

    /// @dev The status and infos of a collaborator
    /// @param shares The share of contributions of the collaborator
    /// @param totalWithdrawn The total amount of funds withdrawn by the collaborator
    struct Collaborator {
        uint256 share;
        uint256 totalWithdrawn;
    }

    /// @dev The addresses of the collaborators
    address[] private s_collaboratorsAddresses;
    /// @dev The status and infos of the collaborators (share & total withdrawn)
    mapping(address => Collaborator) private s_collaborators;

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
        if (s_collaborators[msg.sender].share == 0)
            revert DACProject__NOT_COLLABORATOR();
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

    /* -------------------------------------------------------------------------- */
    /*                                   SETTERS                                  */
    /* -------------------------------------------------------------------------- */

    /* -------------------------------------------------------------------------- */
    /*                                   GETTERS                                  */
    /* -------------------------------------------------------------------------- */

    /**
     * @notice Know if an address is a collaborator
     * @param _collaborator The address to check
     */

    function isCollaborator(
        address _collaborator
    ) external view returns (bool) {
        return s_collaborators[_collaborator].share > 0;
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
