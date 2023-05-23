// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "./DACProject.sol";

/**
 * @title DAC (Decentralized Autonomous Crowdfunding) Factory
 * @author polarzero
 * @notice ...
 * @dev ...
 */

contract DACFactory {
    /* -------------------------------------------------------------------------- */
    /*                                CUSTOM ERRORS                               */
    /* -------------------------------------------------------------------------- */

    /// @dev This function can only be called by the owner of the contract
    error DACFactory__NOT_OWNER();

    /**
     * @dev submitProject()
     */

    /// @dev The length of the collaborators and shares arrays should be the same
    error DACFactory__submitProject__INVALID_LENGTH();
    /// @dev The collaborators array should include the initiator
    error DACFactory__submitProject__DOES_NOT_INCLUDE_INITIATOR();
    /// @dev The total shares should be 100
    error DACFactory__submitProject__INVALID_SHARES();
    /// @dev The timespan should be at least 30 days
    error DACFactory__submitProject__INVALID_TIMESPAN();
    /// @dev The name should be at least 2 characters and at most 50 characters
    error DACFactory__submitProject__INVALID_NAME();

    /* -------------------------------------------------------------------------- */
    /*                                   EVENTS                                   */
    /* -------------------------------------------------------------------------- */

    /// @dev Emitted when a project is submitted to the DAC process
    /// @dev See the struct `Project` for more details about the parameters
    /// @dev See the function `submitProject()` for more details about the process
    event DACFactory__ProjectSubmitted(Project project);

    /* -------------------------------------------------------------------------- */
    /*                                   STORAGE                                  */
    /* -------------------------------------------------------------------------- */

    /// @dev The address of the owner (deployer) of this contract
    address private immutable i_owner;
    /// @dev The period of each phase in seconds
    // This can be updated and will be reflected in the next child contracts, but not in the current ones
    uint256 private s_phasePeriod;

    /// @dev A project that was submitted to the DAC process
    /// @param collaborators The addresses of the collaborators (including the initiator)
    /// @param shares The shares of each collaborator (in the same order as the collaborators array)
    /// @param projectContract The address of the child contract for this project
    /// @param initiator The address of the initiator
    /// @param target The hardcap of the project in wei (can be left to 0 if there is no hardcap)
    /// @param timeSpan The timespan of the payment process in seconds
    /// @param createdAt The timestamp of when the project was submitted
    /// @param phasePeriod The period for each phase in seconds
    /// @param name The name of the project
    /// @param description A short description of the project
    /// @dev See the `submitProject()` function for more details
    struct Project {
        address[] collaborators;
        uint256[] shares;
        address projectContract;
        address initiator;
        uint256 target;
        uint256 timeSpan;
        uint256 createdAt;
        uint256 phasePeriod;
        string name;
        string description;
    }

    /// @dev The array of projects
    Project[] private s_projects;

    /* -------------------------------------------------------------------------- */
    /*                                  MODIFIERS                                 */
    /* -------------------------------------------------------------------------- */

    /**
     * @notice Restricts the access to the owner of the contract
     */

    modifier onlyOwner() {
        if (msg.sender != i_owner) revert DACFactory__NOT_OWNER();
        _;
    }

    /* -------------------------------------------------------------------------- */
    /*                                 CONSTRUCTOR                                */
    /* -------------------------------------------------------------------------- */

    /**
     * @notice The constructor of the DAC aggregator contract
     * @param _phasePeriod The period for each phase in seconds
     */
    constructor(uint256 _phasePeriod) {
        // Set the deployer
        i_owner = msg.sender;

        // Set the constructor parameters
        s_phasePeriod = _phasePeriod;
    }

    /* -------------------------------------------------------------------------- */
    /*                                  FUNCTIONS                                 */
    /* -------------------------------------------------------------------------- */

    /**
     * @notice Submits a project to the DAC process
     * @param _collaborators The addresses of the collaborators (including the initiator)
     * @param _shares The shares of each collaborator (in the same order as the collaborators array)
     * @param _target The hardcap of the project in wei (can be left to 0 if there is no hardcap)
     * @param _timeSpan The timespan of the payment process in seconds
     * @param _name The name of the project
     * @param _description A short description of the project
     * @dev Note the following requirements:
     * - The initiator should be included in the collaborators array
     * - The shares should add up to 100
     * - The timespan should be at least 30 days
     * - The name should be at least 2 characters and at most 50 characters
     * - The description is optional
     * @dev This will create a child contract for the project, with the current set interval between each phase
     */
    function submitProject(
        address[] memory _collaborators,
        uint256[] memory _shares,
        uint256 _target,
        uint256 _timeSpan,
        string memory _name,
        string memory _description
    ) external {
        // It should have a share for each collaborator
        if (_collaborators.length != _shares.length)
            revert DACFactory__submitProject__INVALID_LENGTH();

        uint256 totalShares = 0;
        bool includesInitiator = false;
        for (uint256 i = 0; i < _collaborators.length; i++) {
            // Calculate the total shares
            totalShares += _shares[i];
            // Make sure the initiator is included
            if (_collaborators[i] == msg.sender) {
                includesInitiator = true;
            }
        }
        // It should include the initiator
        if (!includesInitiator)
            revert DACFactory__submitProject__DOES_NOT_INCLUDE_INITIATOR();
        // The total shares should be 100
        if (totalShares != 100)
            revert DACFactory__submitProject__INVALID_SHARES();

        // It should have a target time span of at least 30 days
        if (_timeSpan < 30 days)
            revert DACFactory__submitProject__INVALID_TIMESPAN();

        // It should have a name of at least 2 characters and at most 50 characters
        if (bytes(_name).length < 2 || bytes(_name).length > 50)
            revert DACFactory__submitProject__INVALID_NAME();

        uint256 phasePeriod = s_phasePeriod;

        // Create a child contract for the project
        DACProject projectContract = new DACProject(
            _collaborators,
            _shares,
            msg.sender,
            _target,
            _timeSpan,
            phasePeriod,
            _name,
            _description
        );

        Project memory project = Project(
            _collaborators,
            _shares,
            address(projectContract),
            msg.sender,
            _target,
            _timeSpan,
            block.timestamp,
            phasePeriod,
            _name,
            _description
        );

        // Add it to the projects array
        s_projects.push(project);
        // Emit an event
        emit DACFactory__ProjectSubmitted(project);
    }

    /* -------------------------------------------------------------------------- */
    /*                                   SETTERS                                  */
    /* -------------------------------------------------------------------------- */

    /**
     * @notice Sets the interval between each phase in seconds
     * @param _phasePeriod The period for each phase in seconds
     */

    function setPhasePeriod(uint256 _phasePeriod) external onlyOwner {
        s_phasePeriod = _phasePeriod;
    }

    /* -------------------------------------------------------------------------- */
    /*                                   GETTERS                                  */
    /* -------------------------------------------------------------------------- */

    /**
     * @notice Returns all the projects submitted to the DAC
     * @return struct The array of projects
     */

    function getProjects() external view returns (Project[] memory) {
        return s_projects;
    }

    /**
     * @notice Returns a specific project
     * @param _index The index of the project in the array
     * @return struct The project
     */

    function getProjectAtIndex(
        uint256 _index
    ) external view returns (Project memory) {
        return s_projects[_index];
    }

    /**
     * @notice Returns the current period for each phase
     * @return uint256 The period for each phase in seconds
     */

    function getPhasePeriod() external view returns (uint256) {
        return s_phasePeriod;
    }

    /**
     * @notice Returns the address of the owner of this contract
     * @return address The address of the owner
     */

    function getOwner() external view returns (address) {
        return i_owner;
    }
}
