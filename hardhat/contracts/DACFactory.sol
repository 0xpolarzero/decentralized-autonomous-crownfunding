// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@chainlink/contracts/src/v0.8/interfaces/LinkTokenInterface.sol";
import "@chainlink/contracts/src/v0.8/AutomationCompatible.sol";
import "./DACProject.sol";

/**
 * @title DAC (Decentralized Autonomous Crowdfunding) Factory
 * @author polarzero
 * @notice ...
 * @dev ...
 */

contract DACFactory is AutomationCompatibleInterface {
    LinkTokenInterface internal immutable LINK;

    /* -------------------------------------------------------------------------- */
    /*                                CUSTOM ERRORS                               */
    /* -------------------------------------------------------------------------- */

    /// @dev This function can only be called by the owner of the contract
    error DACFactory__NOT_OWNER();
    /// @dev The transfer failed
    error DACFactory__TRANSFER_FAILED();

    /**
     * @dev submitProject()
     */

    /// @dev The length of the collaborators and shares arrays should be the same
    error DACFactory__submitProject__INVALID_LENGTH();
    /// @dev The collaborators array should include the initiator
    error DACFactory__submitProject__DOES_NOT_INCLUDE_INITIATOR();
    /// @dev The total shares should be 100
    error DACFactory__submitProject__INVALID_SHARES();
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

    /// @dev The interval between each upkeep
    uint256 private immutable i_interval;
    /// @dev The timestamp of the last upkeep
    uint256 private s_lastUpkeep;
    /// @dev The threshold of the LINK balance for child contracts
    uint256 private s_linkBalanceThreshold;
    /// @dev The amount in LINK to top up when needed
    uint256 private s_linkTopUpAmount;

    /// @dev The array of projects
    Project[] private s_projects;

    /// @dev A project that was submitted to the DAC process
    /// @param collaborators The addresses of the collaborators (including the initiator)
    /// @param shares The shares of each collaborator (in the same order as the collaborators array)
    /// @param projectContract The address of the child contract for this project
    /// @param initiator The address of the initiator of this project
    /// @param createdAt The timestamp of when the project was submitted
    /// @param name The name of the project
    /// @param description A short description of the project
    /// @dev See the `submitProject()` function for more details
    struct Project {
        address[] collaborators;
        uint256[] shares;
        address projectContract;
        address initiator;
        uint256 createdAt;
        string name;
        string description;
    }

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
     * @param _linkToken The address of the LINK token
     * @param _interval The interval between each upkeep
     * @param _linkBalanceThreshold The threshold of the LINK balance for child contracts
     * @param _linkTopUpAmount The amount in LINK to top up when needed
     */

    constructor(
        address _linkToken,
        uint256 _interval,
        uint256 _linkBalanceThreshold,
        uint256 _linkTopUpAmount
    ) {
        // Set the deployer
        i_owner = msg.sender;

        // Set the storage variables
        i_interval = _interval;
        s_lastUpkeep = block.timestamp;
        s_linkBalanceThreshold = _linkBalanceThreshold;
        s_linkTopUpAmount = _linkTopUpAmount;

        // Set the LINK token
        LINK = LinkTokenInterface(_linkToken);
    }

    /* -------------------------------------------------------------------------- */
    /*                                  FUNCTIONS                                 */
    /* -------------------------------------------------------------------------- */

    /**
     * @notice Submits a project to the DAC process
     * @param _collaborators The addresses of the collaborators (including the initiator)
     * @param _shares The shares of each collaborator (in the same order as the collaborators array)
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

        // It should have a name of at least 2 characters and at most 50 characters
        if (bytes(_name).length < 2 || bytes(_name).length > 50)
            revert DACFactory__submitProject__INVALID_NAME();

        // Create a child contract for the project
        DACProject projectContract = new DACProject(
            _collaborators,
            _shares,
            msg.sender,
            _name,
            _description
        );

        Project memory project = Project(
            _collaborators,
            _shares,
            address(projectContract),
            msg.sender,
            block.timestamp,
            _name,
            _description
        );

        // Add it to the projects array
        s_projects.push(project);
        // Emit an event
        emit DACFactory__ProjectSubmitted(project);
    }

    /* -------------------------------------------------------------------------- */
    /*                              CHAINLINK UPKEEP                              */
    /* -------------------------------------------------------------------------- */

    /**
     * @notice The Chainlink Upkeep method to check if an upkeep is needed
     * @dev This will be called by a Chainlink Automation node
     */

    function checkUpkeep(
        bytes calldata
    ) external view override returns (bool, bytes memory) {
        // Initialize an empty array for project addresses
        uint256 projectsLength = s_projects.length;
        address[] memory projectsToTopUp = new address[](projectsLength);
        uint256 count = 0;

        // If the interval has passed
        if (block.timestamp - s_lastUpkeep > i_interval) {
            // Check which project needs to be topped up
            for (uint256 i = 0; i < projectsLength; i++) {
                // If the balance is not high enough, it needs to be topped up during the upkeep
                if (!isLinkBalanceHighEnough(i)) {
                    // Push the address directly into the array
                    projectsToTopUp[count] = s_projects[i].projectContract;
                    count++;
                }
            }

            // If at least one project needs to be topped up
            if (count > 0) {
                // Resize the array to fit only the projects to be topped up
                assembly {
                    mstore(projectsToTopUp, count)
                }

                // Encode the array to bytes
                bytes memory data = abi.encode(projectsToTopUp);

                // Return true to trigger the upkeep, along with the array of projects as bytes
                return (true, data);
            }
        }

        // If no projects need to be topped up or the interval has not passed, do not trigger the upkeep
        return (false, "");
    }

    /**
     * @notice The Chainlink Upkeep method to perform an upkeep
     * @dev This will be called by a Chainlink Automation node
     */

    function performUpkeep(bytes calldata performData) external override {
        // Update the timestamp of the last upkeep
        s_lastUpkeep = block.timestamp;

        // Decode the array of projects to be topped up
        address[] memory projectsToTopUp = abi.decode(performData, (address[]));

        // Top up the projects
        uint256 topUpAmount = s_linkTopUpAmount;
        for (uint256 i = 0; i < projectsToTopUp.length; i++) {
            // Transfer the LINK tokens to the child contract
            bool success = LINK.transfer(projectsToTopUp[i], topUpAmount);
            if (!success) revert DACFactory__TRANSFER_FAILED();
        }
    }

    // Deposit and withdraw LINK tokens

    /**
     * @notice Deposit LINK tokens into this contract
     * @param _amount The amount of LINK tokens to deposit
     */

    function depositLink(uint256 _amount) external onlyOwner {
        bool success = LINK.transferFrom(msg.sender, address(this), _amount);
        if (!success) revert DACFactory__TRANSFER_FAILED();
    }

    /**
     * @notice Withdraw LINK tokens from this contract
     */

    function withdrawLink() external onlyOwner {
        bool success = LINK.transfer(msg.sender, LINK.balanceOf(address(this)));
        if (!success) revert DACFactory__TRANSFER_FAILED();
    }

    /**
     * @notice Verify if the LINK balance for a child contract is high enough or needs to be topped up
     * @param _index The index of the project in the array
     * @return bool If the balance is high enough
     * @dev This will use the `s_linkBalanceThreshold` variable to check if the balance is high enough
     * which depends of the blockchain.
     */

    function isLinkBalanceHighEnough(
        uint256 _index
    ) internal view returns (bool) {
        // Get the project
        Project memory project = s_projects[_index];
        // Get the balance of the child contract
        uint256 balance = LINK.balanceOf(project.projectContract);
        // Return true if the balance is greater than the threshold
        if (balance > s_linkBalanceThreshold) {
            return true;
        } else {
            return false;
        }
    }

    /* -------------------------------------------------------------------------- */
    /*                                   SETTERS                                  */
    /* -------------------------------------------------------------------------- */

    /**
     * @notice Sets the threshold of the LINK balance for child contracts
     * @param _linkBalanceThreshold The threshold of the LINK balance for child contracts
     */

    function setLinkBalanceThreshold(
        uint256 _linkBalanceThreshold
    ) external onlyOwner {
        s_linkBalanceThreshold = _linkBalanceThreshold;
    }

    /**
     * @notice Sets the amount in LINK to top up during the upkeep
     * @param _linkTopUpAmount The amount in LINK
     */

    function setLinkTopUpAmount(uint256 _linkTopUpAmount) external onlyOwner {
        s_linkTopUpAmount = _linkTopUpAmount;
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
     * @notice Returns the interval between each upkeep
     * @return uint256 The interval in seconds
     */

    function getInterval() external view returns (uint256) {
        return i_interval;
    }

    /**
     * @notice Returns the timestamp of the last upkeep
     * @return uint256 The timestamp of the last upkeep
     */

    function getLastUpkeep() external view returns (uint256) {
        return s_lastUpkeep;
    }

    /**
     * @notice Returns the minimum amount in LINK for the child contracts to hold
     * @return uint256 The threshold of the LINK balance for child contracts
     */

    function getLinkBalanceThreshold() external view returns (uint256) {
        return s_linkBalanceThreshold;
    }

    /**
     * @notice Returns the amount in LINK to top up during the upkeep
     * @return uint256 The amount in LINK
     */

    function getLinkTopUpAmount() external view returns (uint256) {
        return s_linkTopUpAmount;
    }

    /**
     * @notice Returns the address of the owner of this contract
     * @return address The address of the owner
     */

    function getOwner() external view returns (address) {
        return i_owner;
    }
}
