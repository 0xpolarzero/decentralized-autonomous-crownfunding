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
    /// @dev The last time the collaborators received their payment
    uint256 private s_lastPaymentTimestamp;

    /// @dev The status and infos of a collaborator
    /// @param shares The share of contributions of the collaborator
    /// @param totalWithdrawn The total amount of funds withdrawn by the collaborator
    struct Collaborator {
        uint256 share;
        uint256 totalWithdrawn;
    }

    /// @dev The status and infos of a contributor
    /// @param amount The amount of funds contributed by the contributor
    /// @param endTimestamp The timestamp of the end of the contributor's subscription
    struct Contributor {
        uint256 amount;
        uint256 endTimestamp;
    }

    /// @dev The addresses of the collaborators
    address[] private s_collaboratorsAddresses;
    /// @dev The addresses of the contributors
    address[] private s_contributorsAddresses;
    /// @dev The status and infos of the collaborators (share & total withdrawn)
    mapping(address => Collaborator) private s_collaborators;
    /// @dev The status and infos of the contributors (amount & end of subscription timestamp)
    mapping(address => Contributor) private s_contributors;

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

        // Initialize state variables
        s_lastCollaboratorCheckTimestamp = block.timestamp;
        s_lastPaymentTimestamp = block.timestamp;

        // Register a new Chainlink Upkeep
    }

    /* -------------------------------------------------------------------------- */
    /*                                  FUNCTIONS                                 */
    /* -------------------------------------------------------------------------- */

    function triggerPayment() public {
        // Should be triggered by the Chainlink Upkeep, if funded with enough LINK
        // If it was not able to do it for a week, collaborators can trigger it manually
    }

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
     * @notice Get the informations of a specific contributor
     * @param _contributor The address of the contributor
     * @return struct The amount contributed by the contributor and the end of subscription timestamp
     */

    function getContributor(
        address _contributor
    ) external view returns (Contributor memory) {
        return s_contributors[_contributor];
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

    /**
     * @notice Get the last time a collaborator has manifested themselves
     * @return uint256 The last time a collaborator has manifested themselves
     */

    function getLastCollaboratorCheckTimestamp()
        external
        view
        returns (uint256)
    {
        return s_lastCollaboratorCheckTimestamp;
    }

    /**
     * @notice Get the last time the collaborators received their payment
     * @return uint256 The last time the collaborators received their payment
     */

    function getLastPaymentTimestamp() external view returns (uint256) {
        return s_lastPaymentTimestamp;
    }
}
