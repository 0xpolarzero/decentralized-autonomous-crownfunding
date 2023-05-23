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
    /// @dev The hardcap of the project in wei (will be 0 if there is no hardcap)
    uint256 private immutable i_target;
    /// @dev The timespan of the payment process in seconds
    uint256 private immutable i_timeSpan;
    /// @dev The period of each phase in seconds
    uint256 private immutable i_phasePeriod;
    /// @dev The creation date of this project
    uint256 private immutable i_createdAt;
    /// @dev The name of the project
    string private i_name;
    /// @dev A short description of the project
    string private i_description;

    /// @dev The share of each collaborator
    mapping(address => uint256) private i_shares;

    /**
     * @dev Updated later
     */

    /// @dev The starting time of the payment process
    uint256 private s_startedPaymentAt;
    /// @dev The current phase of the project
    // 0 = Funding -> anyone can deposit their contribution, this will last for i_phasePeriod
    // 1 = Payment -> collaborators can withdraw part of their share whenever they want,
    // based on the elapsed time, this will last for i_timeSpan
    uint256 private s_currentPhase;

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
     * @param _target The hardcap of the project in wei (can be left to 0 if there is no hardcap)
     * @param _timeSpan The timespan of the payment process in seconds
     * @param _phasePeriod The period for each phase in seconds
     * @param _name The name of the project
     * @param _description A short description of the project
     * @dev All verifications have been done already in the factory contract, so we don't need to check them again
     * @dev This will register a new Chainlink Upkeep in the fly
     */
    constructor(
        address[] memory _collaborators,
        uint256[] memory _shares,
        address _initiator,
        uint256 _target,
        uint256 _timeSpan,
        uint256 _phasePeriod,
        string memory _name,
        string memory _description
    ) {
        // Initialize immutable variables
        i_collaborators = _collaborators;
        i_initiator = _initiator;
        i_target = _target;
        i_timeSpan = _timeSpan;
        i_phasePeriod = _phasePeriod;
        i_name = _name;
        i_description = _description;
        i_createdAt = block.timestamp;

        for (uint256 i = 0; i < _collaborators.length; i++) {
            i_shares[_collaborators[i]] = _shares[i];
        }

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
     * @notice Get the hardcap target of the project
     * @return uint256 The hardcap of the project
     */

    function getTarget() external view returns (uint256) {
        return i_target;
    }

    /**
     * @notice Get the timespan of the payment process
     * @return uint256 The timespan of the payment process
     */

    function getTimeSpan() external view returns (uint256) {
        return i_timeSpan;
    }

    /**
     * @notice Get the period of each phase
     * @return uint256 The period of each phase
     */

    function getPhasePeriod() external view returns (uint256) {
        return i_phasePeriod;
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
     * @notice Get the current phase of the project
     * @return uint256 The current phase of the project
     */

    function getCurrentPhase() external view returns (uint256) {
        return s_currentPhase;
    }

    /**
     * @notice Get the starting time of the payment process
     * @return uint256 The starting time of the payment process
     */

    function getStartedPaymentAt() external view returns (uint256) {
        return s_startedPaymentAt;
    }
}
