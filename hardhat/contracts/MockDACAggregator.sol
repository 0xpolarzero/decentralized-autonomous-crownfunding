// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "./DACProject.sol";
import "./MockDACContributorAccount.sol";

/**
 * @title Mock DAC (Decentralized Autonomous Crowdfunding) Factory
 * @author polarzero
 * @notice ...
 * @dev This contract has the same exact functionalities as the DACAggregator contract
 * @dev The only difference is that it creates a MOCKContributorAccount contract instead of a ContributorAccount contract
 * @dev This is due to the original contributor account contract calling the Chainlink Automation registry and registrar that
 * require extensive setup and configuration to deploy locally. We do choose to keep these verifications for staging (testnet) tests.
 */

contract MockDACAggregator {
    /* -------------------------------------------------------------------------- */
    /*                                CUSTOM ERRORS                               */
    /* -------------------------------------------------------------------------- */

    /// @dev This function can only be called by the owner of the contract
    error DACAggregator__NOT_OWNER();
    /// @dev The transfer failed
    error DACAggregator__TRANSFER_FAILED();

    /**
     * @dev submitProject()
     */

    /// @dev The length of the collaborators and shares arrays should be the same
    error DACAggregator__INVALID_LENGTH();
    /// @dev The collaborators array should include the initiator
    error DACAggregator__DOES_NOT_INCLUDE_INITIATOR();
    /// @dev The total shares should be 100
    error DACAggregator__INVALID_SHARES();
    /// @dev The name should be at least 2 characters and at most 50 characters
    error DACAggregator__INVALID_NAME();

    /**
     * @dev createContributorAccount()
     */

    /// @dev The contributor account already exists
    error DACAggregator__ALREADY_EXISTS();
    /// @dev The payment interval is too short or too long
    error DACAggregator__INVALID_PAYMENT_INTERVAL();

    /**
     * @dev pingProject()
     */

    /// @dev The project doesn't exist
    error DACAggregator__DOES_NOT_EXIST();
    /// @dev The caller is not a collaborator of the project
    error DACAggregator__NOT_COLLABORATOR();
    /// @dev The project is now inactive (30 days after the last ping)
    error DACAggregator__EXPIRED();

    /* -------------------------------------------------------------------------- */
    /*                                   EVENTS                                   */
    /* -------------------------------------------------------------------------- */

    /// @dev Emitted when a project is submitted to the DAC process
    /// @dev See the struct `Project` for more details about the parameters
    /// @dev See the function `submitProject()` for more details about the process
    /// @param project The struct of the project that was submitted
    event DACAggregator__ProjectSubmitted(Project project);

    /// @dev Emitted when a contributor account is created
    /// @dev See the struct `ContributorAccount` for more details about the parameters
    /// @dev See the function `createContributorAccount()` for more details about the process
    /// @param owner The address of the owner of the contributor account
    /// @param contributorAccountContract The address of the contributor account contract
    event DACAggregator__ContributorAccountCreated(
        address owner,
        address contributorAccountContract
    );

    /// @dev Emitted when a project is updated (pinged by a collaborator)
    /// @param projectAddress The address of the project contract
    /// @param collaborator The address of the collaborator who pinged the project
    event DACAggregator__ProjectPinged(
        address projectAddress,
        address collaborator
    );

    /// @dev Emitted when the maximum amount of contributions is updated
    /// @param maxContributions The new maximum amount of contributions
    event DACAggregator__MaxContributionsUpdated(uint256 maxContributions);

    /// @dev Emitted when the maximum gas limit for upkeep calls is updated
    /// @param upkeepGasLimit The new maximum gas limit for upkeep calls
    event DACAggregator__UpkeepGasLimitUpdated(uint32 upkeepGasLimit);
    /// @dev Emitted when the approximate native token / LINK rate is updated
    /// @param nativeTokenLinkRate The new approximate native token / LINK rate
    event DACAggregator__NativeTokenLinkRateUpdated(
        uint256 nativeTokenLinkRate
    );
    /// @dev Emitted when the premium % of this chain is updated
    /// @param premiumPercent The new premium % for this chain
    event DACAggregator__PremiumPercentUpdated(uint256 premiumPercent);

    /* -------------------------------------------------------------------------- */
    /*                                   STORAGE                                  */
    /* -------------------------------------------------------------------------- */

    /// @dev The address of the owner (deployer) of this contract
    address private immutable i_owner;

    /// @dev Chainlink addresses: LINK token
    address private immutable i_linkTokenAddress;
    /// @dev Chainlink addresses: Keeper Registrar
    address private immutable i_keeperRegistrarAddress;
    /// @dev Chainlink addresses: Keeper Registry
    address private immutable i_keeperRegistryAddress;

    /// @dev The maximum amount of contributions for a contributor account
    uint256 private s_maxContributions;
    /// @dev The approximate native token / LINK rate
    uint256 private s_nativeTokenLinkRate;
    /// @dev The premium % of this chain
    uint32 private s_premiumPercent;
    /// @dev The maximum gas limit for upkeep calls
    uint32 private s_upkeepGasLimit;

    /// @dev The array of projects
    // Project[] private s_projects;
    /// @dev The array of contributor accounts
    // ContributorAccount[] private s_contributorAccounts;
    /// @dev The mapping of project contract addresses to their project information
    mapping(address => Project) private s_projects;
    /// @dev The mapping of contributor addresses to their account (contract) address
    mapping(address => address) private s_contributorAccounts;

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
        uint256 lastActivityAt;
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
        if (msg.sender != i_owner) revert DACAggregator__NOT_OWNER();
        _;
    }

    /* -------------------------------------------------------------------------- */
    /*                                 CONSTRUCTOR                                */
    /* -------------------------------------------------------------------------- */

    /**
     * @notice The constructor of the DAC aggregator contract
     * @param _linkTokenAddress The address of the LINK token
     * @param _keeperRegistrarAddress The address of the Keeper Registrar
     * @param _keeperRegistryAddress The address of the Keeper Registry
     * @param _maxContributions The maximum amount of contributions for a contributor account
     * @param _nativeTokenLinkRate The approximate native token / LINK rate
     * @param _premiumPercent The premium % of this chain
     * @param _upkeepGasLimit The maximum gas limit for upkeep calls
     */

    constructor(
        address _linkTokenAddress,
        address _keeperRegistrarAddress,
        address _keeperRegistryAddress,
        uint256 _maxContributions,
        uint256 _nativeTokenLinkRate,
        uint32 _premiumPercent,
        uint32 _upkeepGasLimit
    ) {
        // Set the deployer
        i_owner = msg.sender;

        // Set the Chainlink addresses
        i_linkTokenAddress = _linkTokenAddress;
        i_keeperRegistrarAddress = _keeperRegistrarAddress;
        i_keeperRegistryAddress = _keeperRegistryAddress;

        // Set the storage variables
        s_maxContributions = _maxContributions;
        s_nativeTokenLinkRate = _nativeTokenLinkRate;
        s_premiumPercent = _premiumPercent;
        s_upkeepGasLimit = _upkeepGasLimit;
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
     * @dev This will create a child contract for the project with the current parameters
     */

    function submitProject(
        address[] memory _collaborators,
        uint256[] memory _shares,
        string memory _name,
        string memory _description
    ) external {
        // It should have a share for each collaborator
        if (_collaborators.length != _shares.length)
            revert DACAggregator__INVALID_LENGTH();

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
            revert DACAggregator__DOES_NOT_INCLUDE_INITIATOR();
        // The total shares should be 100
        if (totalShares != 100) revert DACAggregator__INVALID_SHARES();

        // It should have a name of at least 2 characters and at most 50 characters
        if (bytes(_name).length < 2 || bytes(_name).length > 50)
            revert DACAggregator__INVALID_NAME();

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
            block.timestamp,
            _name,
            _description
        );

        // Add it to the projects array and mapping
        // s_projects.push(project);
        s_projects[address(projectContract)] = project;
        // Emit an event
        emit DACAggregator__ProjectSubmitted(project);
    }

    /**
     * @notice Create a contributor wallet
     * @param _paymentInterval The payment interval in seconds, meaning how frequently will the upkeep be called
     * A higher upkeep meaning a higher cost in LINK tokens
     * Minimum is 1 day (86400 seconds) and maximum is 30 days (2592000 seconds)
     * @dev This will create a child contract for the contributor, including a Chainlink upkeep
     * @dev This is kind of a smart contract wallet
     * @dev For more information, see the `DACContributorAccount` contract
     */

    function createContributorAccount(uint256 _paymentInterval) external {
        // It should not have a contributor account already
        if (s_contributorAccounts[msg.sender] != address(0))
            revert DACAggregator__ALREADY_EXISTS();

        // It should be at least 1 day and at most 30 days
        if (_paymentInterval < 1 days || _paymentInterval > 30 days)
            revert DACAggregator__INVALID_PAYMENT_INTERVAL();

        // Create a child contract for the contributor
        /// @dev We're creating a mock contract here, without the actual Upkeep registration
        MockDACContributorAccount contributorContract = new MockDACContributorAccount(
                msg.sender,
                i_linkTokenAddress,
                i_keeperRegistrarAddress,
                i_keeperRegistryAddress,
                _paymentInterval,
                s_maxContributions,
                s_upkeepGasLimit
            );

        // Add it to the contributors array and mapping
        s_contributorAccounts[msg.sender] = address(contributorContract);

        emit DACAggregator__ContributorAccountCreated(
            msg.sender,
            address(contributorContract)
        );
    }

    /**
     * @notice Ping a project as a collaborator
     * @param _projectAddress The address of the project
     * @dev This will update the project's last activity timestamp
     * @dev It should be done by any of the collaborators at least once every 30 days so it can
     * keep receiving contributions
     */

    function pingProject(address _projectAddress) external {
        // It should be an existing project
        if (s_projects[_projectAddress].initiator == address(0))
            revert DACAggregator__DOES_NOT_EXIST();

        // It should be a collaborator
        if (
            !DACProject(payable(address(_projectAddress))).isCollaborator(
                msg.sender
            )
        ) revert DACAggregator__NOT_COLLABORATOR();

        // It should not be too late to ping the project (after 30 days of inactivity)
        if (
            block.timestamp >
            s_projects[_projectAddress].lastActivityAt + 30 days
        ) revert DACAggregator__EXPIRED();

        // Update the project's last activity timestamp
        s_projects[_projectAddress].lastActivityAt = block.timestamp;
        // Emit an event
        emit DACAggregator__ProjectPinged(_projectAddress, msg.sender);
    }

    /* -------------------------------------------------------------------------- */
    /*                                   SETTERS                                  */
    /* -------------------------------------------------------------------------- */

    /**
     * @notice Update the maximum amount of contributions for a contributor account
     * @param _maxContributions The new maximum amount of contributions
     * @dev This will only affect new contributor accounts
     */

    function setMaxContributions(uint256 _maxContributions) external onlyOwner {
        s_maxContributions = _maxContributions;
        emit DACAggregator__MaxContributionsUpdated(_maxContributions);
    }

    /* -------------------------------------------------------------------------- */
    /*                                   GETTERS                                  */
    /* -------------------------------------------------------------------------- */

    /**
     * @notice Know if a project is active
     * @param _projectAddress The address of the project
     * @return bool Whether the project is active or not
     * @dev A project is active if it has been pinged by a collaborator during the last 30 days
     */

    function isProjectActive(
        address _projectAddress
    ) external view returns (bool) {
        return
            block.timestamp - s_projects[_projectAddress].lastActivityAt <
            30 days;
    }

    /**
     * @notice Returns the project information
     * @param _projectAddress The address of the project
     * @return struct The project
     */

    function getProject(
        address _projectAddress
    ) external view returns (Project memory) {
        return s_projects[_projectAddress];
    }

    /**
     * @notice Returns a specific contributor's account contract address
     * @param _contributor The address of the contributor
     * @return address The address of the contract of the contributor's account
     */

    function getContributorAccount(
        address _contributor
    ) external view returns (address) {
        return s_contributorAccounts[_contributor];
    }

    /**
     * @notice Returns the address of the owner of this contract
     * @return address The address of the owner
     */

    function getOwner() external view returns (address) {
        return i_owner;
    }

    /**
     * @notice Returns the maximum amount of contributions for a contributor account
     * @return uint256 The maximum amount of contributions
     */

    function getMaxContributions() external view returns (uint256) {
        return s_maxContributions;
    }

    /* -------------------------------------------------------------------------- */
    /*                                   UPKEEP                                   */
    /* -------------------------------------------------------------------------- */

    /**
     * @notice Update the native token / LINK rate
     * @param _rate The new rate
     */

    function setNativeTokenLinkRate(uint256 _rate) external onlyOwner {
        s_nativeTokenLinkRate = _rate;
        emit DACAggregator__NativeTokenLinkRateUpdated(_rate);
    }

    /**
     * @notice Update the premium % for this chain
     * @param _premium The new premium %
     */

    function setPremiumPercent(uint32 _premium) external onlyOwner {
        s_premiumPercent = _premium;
        emit DACAggregator__PremiumPercentUpdated(_premium);
    }

    /**
     * @notice Update the gas limit for an upkeep call
     * @param _gasLimit The new gas limit
     * @dev This will only affect new contributor accounts
     */

    function setUpkeepGasLimit(uint32 _gasLimit) external onlyOwner {
        s_upkeepGasLimit = _gasLimit;
        emit DACAggregator__UpkeepGasLimitUpdated(_gasLimit);
    }

    /**
     * @dev Calculate the approximate price of an upkeep based on the number of contributions
     * @param _upkeepGasLimit The gas limit of the upkeep (since we can't use the stored one, that could be updated here
     * but not on a previously created contributor account)
     * @return uint256 The approximate price of an upkeep
     * @dev This would fail if the native token / LINK rate were to become lower than 1
     */

    function calculateUpkeepPrice(
        uint32 _upkeepGasLimit
    ) external view returns (uint256) {
        // The formula is the following:
        // [gasUsed * gasPrice * (1 + premium%) + (80,000 * gasPrice)] * (NativeToken / LINK rate)
        // e.g. on Polygon Mumbai the premium is 429 % & the MATIC/LINK rate is ~ 1/7 (may 2023)

        // We need to assume a gas price, and should better use a high one
        uint256 gasPrice = 200 gwei;

        console.log(
            (((_upkeepGasLimit * (gasPrice /* / 1e9 */)) *
                (1 + s_premiumPercent / 100) +
                (80_000 * (gasPrice /* / 1e9 */))) * (s_nativeTokenLinkRate)) /
                // / 100 because the native token / LINK rate has been multiplied by 100
                100
        );

        // Return the price
        return ((((_upkeepGasLimit * (gasPrice /* / 1e9 */)) *
            (1 + s_premiumPercent / 100) +
            (80_000 * (gasPrice /* / 1e9 */))) * (s_nativeTokenLinkRate)) /
            // / 100 because the native token / LINK rate has been multiplied by 100
            100);
    }

    /**
     * @notice Returns the address of the LINK token
     * @return address The address of the LINK token
     */

    function getLinkTokenAddress() external view returns (address) {
        return i_linkTokenAddress;
    }

    /**
     * @notice Returns the address of the Keeper Registrar
     * @return address The address of the Keeper Registrar
     */

    function getKeeperRegistrarAddress() external view returns (address) {
        return i_keeperRegistrarAddress;
    }

    /**
     * @notice Returns the address of the Keeper Registry
     * @return address The address of the Keeper Registry
     */

    function getKeeperRegistryAddress() external view returns (address) {
        return i_keeperRegistryAddress;
    }

    /**
     * @notice Get the native token / LINK rate
     * @return uint256 The native token / LINK rate
     */

    function getNativeTokenLinkRate() external view returns (uint256) {
        return s_nativeTokenLinkRate;
    }

    /**
     * @notice Get the premium % for this chain
     * @return uint256 The premium %
     */

    function getPremiumPercent() external view returns (uint32) {
        return s_premiumPercent;
    }

    /**
     * @notice Returns the gas limit for an upkeep call
     * @return uint32 The gas limit
     */

    function getUpkeepGasLimit() external view returns (uint32) {
        return s_upkeepGasLimit;
    }
}
