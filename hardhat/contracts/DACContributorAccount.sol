// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "./ChainlinkManager.sol";
import "./DACAggregatorInterface.sol";
import "./DACContributorLibrary.sol";

/**
 * @title DAC (Decentralized Autonomous Crowdfunding) Contributor account
 * @author polarzero
 * @notice ...
 */

contract DACContributorAccount is AutomationCompatibleInterface {
    using DACContributorLibrary for DACContributorLibrary.Contribution;
    using DACContributorLibrary for DACContributorLibrary.ContributionMinimal;

    LinkTokenInterface internal immutable LINK;
    KeeperRegistrarInterface internal immutable REGISTRAR;
    KeeperRegistryInterface internal immutable REGISTRY;
    DACAggregatorInterface internal immutable DAC_AGGREGATOR;

    /* -------------------------------------------------------------------------- */
    /*                                CUSTOM ERRORS                               */
    /* -------------------------------------------------------------------------- */

    /// @dev This function can only be called by the owner of the account
    error DACContributorAccount__NOT_OWNER();
    /// @dev The transfer failed
    error DACContributorAccount__TRANSFER_FAILED();

    /**
     * @dev Contributions
     */

    /// @dev The call to an external contract failed
    error DACContributorAccount__CALL_FAILED();
    /// @dev The contribution is already fully distributed
    error DACContributorAccount__CONTRIBUTION_ALREADY_DISTRIBUTED();
    /// @dev The project is not active anymore
    error DACContributorAccount__PROJECT_NOT_ACTIVE();
    /// @dev The amount sent is not correct
    error DACContributorAccount__INCORRECT_AMOUNT();
    /// @dev There are already too many contributions
    error DACContributorAccount__TOO_MANY_CONTRIBUTIONS();
    /// @dev The timestamp is in the past
    error DACContributorAccount__INVALID_TIMESTAMP();
    /// @dev There is no contribution to send (already fully distributed or the project is not active anymore)
    error DACContributorAccount__NO_CONTRIBUTION_TO_SEND();

    /**
     * @dev Upkeep
     */

    /// @dev An upkeep is already registered
    error DACContributorAccount__UPKEEP_ALREADY_REGISTERED();
    /// @dev The upkeep is not registered
    error DACContributorAccount__UPKEEP_NOT_REGISTERED();
    /// @dev The upkeep registration failed
    error DACContributorAccount__UPKEEP_REGISTRATION_FAILED();
    /// @dev The amount of LINK to fund the upkeep is too low
    error DACContributorAccount__FUNDING_AMOUNT_TOO_LOW();
    /// @dev The upkeep interval is either too low or too high
    error DACContributorAccount__INVALID_UPKEEP_INTERVAL();

    /* -------------------------------------------------------------------------- */
    /*                                   EVENTS                                   */
    /* -------------------------------------------------------------------------- */

    /**
     * @dev Contributions
     */

    /// @dev Emitted when a new contribution is created
    /// @param projectContract The address of the project contract
    /// @param amount The amount of the contribution
    /// @param endDate The timestamp when the contribution ends
    event DACContributorAccount__ContributionCreated(
        address indexed projectContract,
        uint256 amount,
        uint256 endDate
    );

    /// @dev Emitted when a contribution is updated
    /// @param projectContract The address of the project contract
    /// @param amount The new amount of the contribution
    event DACContributorAccount__ContributionUpdated(
        address indexed projectContract,
        uint256 amount
    );

    /// @dev Emitted when a contribution is deleted
    /// @param projectContract The address of the project contract
    /// @param amount The amount of the contribution that is withdrawn
    event DACContributorAccount__ContributionCanceled(
        address indexed projectContract,
        uint256 amount
    );

    /// @dev Emitted when all the contributions are deleted
    /// @param contributions The structs of the contributions that are withdrawn
    /// @param amount The amount of the contributions that are withdrawn
    event DACContributorAccount__AllContributionsCanceled(
        DACContributorLibrary.Contribution[] contributions,
        uint256 amount
    );

    /// @dev Emitted when the contributions are sent to the projects
    /// @param contributions The structs of the contributions that are sent (minimized)
    event DACContributorAccount__ContributionsTransfered(
        DACContributorLibrary.ContributionMinimal[] contributions
    );

    /**
     * @dev Upkeep
     */

    /// @dev Emitted when the upkeep is registered
    /// @param upkeepId The ID of the upkeep
    /// @param interval The interval between each payment (upkeep)
    event DACContributorAccount__UpkeepRegistered(
        uint256 upkeepId,
        uint256 interval
    );

    /// @dev Emitted when the upkeep is canceled
    /// @param upkeepId The ID of the upkeep
    event DACContributorAccount__UpkeepCanceled(uint256 upkeepId);

    /// @dev Emitted when the upkeep funds are withdrawn
    /// @param upkeepId The ID of the upkeep
    event DACContributorAccount__UpkeepFundsWithdrawn(uint256 upkeepId);

    /// @dev Emitted when the upkeep interval is updated
    /// @param interval The new interval between each payment (upkeep)
    event DACContributorAccount__UpkeepIntervalUpdated(uint256 interval);

    /* -------------------------------------------------------------------------- */
    /*                                   STORAGE                                  */
    /* -------------------------------------------------------------------------- */

    /// @dev The address of the owner of the account
    address private immutable i_owner;
    /// @dev The creation date of this account
    uint256 private immutable i_createdAt;
    /// @dev The maximum amount of contributions that can be stored in the account
    // This prevents the upkeeps from failing if the load were to be too high
    uint256 private immutable i_maxContributions;

    /// @dev The ID of the Chainlink Upkeep
    uint256 private s_upkeepId;
    /// @dev The gas limit of the Chainlink Upkeep
    uint32 private s_upkeepGasLimit;
    /// @dev The last time the contributions were sent to the supported projects though the upkeep
    uint256 private s_lastUpkeep;
    /// @dev The interval between each payment
    // The owner of the account can change this value, knowing that a smaller value will require more LINK
    uint256 private s_upkeepInterval;
    /// @dev Whether an upkeep is registered or not
    bool private s_upkeepRegistered;

    /// @dev The projects the account is contributing to
    DACContributorLibrary.Contribution[] private s_contributions;

    /* -------------------------------------------------------------------------- */
    /*                                  MODIFIERS                                 */
    /* -------------------------------------------------------------------------- */

    /**
     * @notice Restricts the access to the initiator of the project
     */

    modifier onlyOwner() {
        if (msg.sender != i_owner) revert DACContributorAccount__NOT_OWNER();
        _;
    }

    /* -------------------------------------------------------------------------- */
    /*                                 CONSTRUCTOR                                */
    /* -------------------------------------------------------------------------- */

    /**
     * @notice The constructor of the account contract
     * @param _owner The address of the owner of the account
     * @param _linkToken The address of the LINK token
     * @param _registrar The address of the Chainlink Keeper Registrar
     * @param _registry The address of the Chainlink Keeper Registry
     * @param _paymentInterval The interval between each payment (upkeep)
     * @param _maxContributions The maximum amount of contributions that can be stored in the account
     * @param _upkeepGasLimit The gas limit for the Chainlink Upkeep
     * @dev This will register a new Chainlink Upkeep in the fly
     */
    constructor(
        address _owner,
        address _linkToken,
        address _registrar,
        address _registry,
        uint256 _paymentInterval,
        uint256 _maxContributions,
        uint32 _upkeepGasLimit
    ) {
        // Initialize the owner and the creation date
        i_owner = _owner;
        i_createdAt = block.timestamp;
        i_maxContributions = _maxContributions;

        // Initialize storage variables
        s_lastUpkeep = block.timestamp;
        s_upkeepInterval = _paymentInterval;
        s_upkeepGasLimit = _upkeepGasLimit;

        // Initialize the Chainlink variables
        LINK = LinkTokenInterface(_linkToken);
        REGISTRAR = KeeperRegistrarInterface(_registrar);
        REGISTRY = KeeperRegistryInterface(_registry);

        // Initialize the DAC Aggregator
        DAC_AGGREGATOR = DACAggregatorInterface(msg.sender);
    }

    /* -------------------------------------------------------------------------- */
    /*                                  FUNCTIONS                                 */
    /* -------------------------------------------------------------------------- */

    /**
     * @notice Create a new contribution to a project
     * @param _projectContract The address of the project contract
     * @param _amount The amount of the contribution
     * @param _endDate The timestamp when the contribution ends
     */

    function createContribution(
        address _projectContract,
        uint256 _amount,
        uint256 _endDate
    ) external payable onlyOwner {
        // Check if the project is still active
        if (!isProjectStillActive(_projectContract))
            revert DACContributorAccount__PROJECT_NOT_ACTIVE();

        // Check if the amount is correct
        if (_amount == 0 || msg.value != _amount)
            revert DACContributorAccount__INCORRECT_AMOUNT();

        // Check if the amount is not higher than the maximum amount of contributions
        if (s_contributions.length > i_maxContributions)
            revert DACContributorAccount__TOO_MANY_CONTRIBUTIONS();

        // Check if the end date is not in the past
        if (_endDate < block.timestamp)
            revert DACContributorAccount__INVALID_TIMESTAMP();

        // Create the contribution
        DACContributorLibrary.Contribution
            memory contribution = DACContributorLibrary.Contribution({
                projectContract: _projectContract,
                amountStored: _amount,
                amountDistributed: 0,
                startedAt: block.timestamp,
                endsAt: _endDate
            });

        s_contributions.push(contribution);

        // Update the contributions in the aggregator
        DAC_AGGREGATOR.onContributionCreated(address(this), contribution);

        emit DACContributorAccount__ContributionCreated(
            _projectContract,
            _amount,
            _endDate
        );
    }

    /**
     * @notice Update the amount of a contribution
     * @param _index The index of the contribution in the array
     * @param _amount The new amount
     */

    function updateContribution(
        uint256 _index,
        uint256 _amount
    ) external payable onlyOwner {
        DACContributorLibrary.Contribution
            memory contribution = s_contributions[_index];
        // Check if the contribution is still active
        if (!isContributionAlreadyDistributed(contribution))
            revert DACContributorAccount__CONTRIBUTION_ALREADY_DISTRIBUTED();

        if (_amount > contribution.amountStored) {
            // If it's an increase, check that the amount sent is correct
            if (msg.value != _amount - contribution.amountStored)
                revert DACContributorAccount__INCORRECT_AMOUNT();

            // Increment the amount of the contribution
            s_contributions[_index].amountStored = _amount;
        } else {
            // If it's a decrease, check that the amount is not lower than what is left to distribute
            if (_amount < contribution.amountDistributed)
                revert DACContributorAccount__INCORRECT_AMOUNT();

            // Decrement the amount of the contribution
            s_contributions[_index].amountStored = _amount;

            // Withdraw the difference
            uint256 difference = contribution.amountStored - _amount;
            (bool success, ) = msg.sender.call{value: difference}("");
            if (!success) revert DACContributorAccount__TRANSFER_FAILED();
        }

        emit DACContributorAccount__ContributionUpdated(
            contribution.projectContract,
            _amount
        );
    }

    /**
     * @notice Cancel all the contributions and withdraw the funds
     */

    function cancelAllContributions() external onlyOwner {
        DACContributorLibrary.Contribution[]
            memory contributions = s_contributions;
        uint256 contractBalance = address(this).balance;

        // Remove all the contributions from the array
        delete s_contributions;

        // Withdraw everything from this contract
        (bool success, ) = msg.sender.call{value: address(this).balance}("");
        if (!success) revert DACContributorAccount__TRANSFER_FAILED();

        emit DACContributorAccount__AllContributionsCanceled(
            contributions,
            contractBalance
        );
    }

    /**
     * @notice Trigger the payment of all the contributions manually
     * @dev This can be called by the owner of the account if the Chainlink Upkeeps failed,
     * or just if they want to trigger the payment manually at any time
     */

    function triggerManualPayment() external onlyOwner {
        // Check which contributions need to be sent
        DACContributorLibrary.ContributionMinimal[]
            memory contributionsToSend = calculateContributions();

        // If there is no contribution to send, revert
        if (contributionsToSend.length == 0)
            revert DACContributorAccount__NO_CONTRIBUTION_TO_SEND();

        // Update the timestamp of the last upkeep
        s_lastUpkeep = block.timestamp;

        // If at least one project is still active
        if (contributionsToSend.length > 0) {
            // Send the contributions
            transferContributions(contributionsToSend);
        }
    }

    /**
     * @notice Send the contributions to the projects
     * @param _contributionsToSend The contributions to send
     */

    function transferContributions(
        DACContributorLibrary.ContributionMinimal[] memory _contributionsToSend
    ) internal {
        // For each contribution
        for (uint256 i = 0; i < _contributionsToSend.length; ) {
            // Update the amount distributed
            unchecked {
                s_contributions[_contributionsToSend[i].index]
                    .amountDistributed += _contributionsToSend[i].amount;
            }

            // Send the contribution
            (bool success, ) = _contributionsToSend[i].projectContract.call{
                value: _contributionsToSend[i].amount
            }("");

            if (!success) revert DACContributorAccount__CALL_FAILED();

            unchecked {
                i++;
            }
        }

        emit DACContributorAccount__ContributionsTransfered(
            _contributionsToSend
        );
    }

    /* -------------------------------------------------------------------------- */
    /*                                   UPKEEP                                   */
    /* -------------------------------------------------------------------------- */

    /**
     * @notice Register a new Chainlink Upkeep
     * @param _fundingAmount The amount of LINK to initially fund the upkeep
     * @dev The user needs to send the amount of LINK to the contract before calling this function
     * @dev The upkeep can then be funded by directly interacting with the Registry contract
     */

    function registerNewUpkeep(uint96 _fundingAmount) public onlyOwner {
        if (s_upkeepRegistered)
            revert DACContributorAccount__UPKEEP_ALREADY_REGISTERED();

        if (_fundingAmount < 0.1 * 10 ** 18)
            revert DACContributorAccount__FUNDING_AMOUNT_TOO_LOW();

        // Approve spending of LINK
        LINK.approve(address(REGISTRAR), _fundingAmount);

        // Register the Chainlink Upkeep
        uint256 upkeepId = REGISTRAR.registerUpkeep(
            RegistrationParams({
                name: "DACContributorAccount",
                encryptedEmail: hex"",
                upkeepContract: address(this),
                gasLimit: s_upkeepGasLimit,
                adminAddress: i_owner,
                checkData: hex"",
                offchainConfig: hex"",
                amount: _fundingAmount
            })
        );

        if (upkeepId == 0)
            revert DACContributorAccount__UPKEEP_REGISTRATION_FAILED();

        s_upkeepId = upkeepId;
        s_upkeepRegistered = true;

        emit DACContributorAccount__UpkeepRegistered(
            s_upkeepId,
            s_upkeepInterval
        );
    }

    /**
     * @notice Cancel the registration of the Chainlink Upkeep
     * @dev This will cancel the upkeep but it won't withdraw the funds
     */

    function cancelUpkeep() external onlyOwner {
        if (!s_upkeepRegistered)
            revert DACContributorAccount__UPKEEP_NOT_REGISTERED();

        // Cancel the Chainlink Upkeep
        REGISTRY.cancelUpkeep(s_upkeepId);
        // Set the upkeep as not registered
        s_upkeepRegistered = false;

        emit DACContributorAccount__UpkeepCanceled(s_upkeepId);
    }

    /**
     * @notice Withdraw the funds from the Chainlink Upkeep
     * @dev The upkeep needs to be canceled first, and the funds can be withdrawn
     * only after 50 blocks
     * @dev It will send the funds to the owner of the account
     * @dev The frontend should carefully let the owner cancel the upkeep and withdraw the funds, before
     * allowing them to create a new upkeep, or they would lose the ID ; even though it could still be grabbed
     * from the registry/events to withdraw the funds later
     */

    function withdrawUpkeepFunds() external onlyOwner {
        // Withdraw the funds from the Chainlink Upkeep
        REGISTRY.withdrawFunds(s_upkeepId, i_owner);

        emit DACContributorAccount__UpkeepFundsWithdrawn(s_upkeepId);
    }

    /**
     * @notice The Chainlink Upkeep method to check if an upkeep is needed
     * @dev This will be called by a Chainlink Automation node
     * @dev This won't use any gas so we take advantage of this to calculate the contributions here
     */

    function checkUpkeep(
        bytes calldata
    ) external view override returns (bool, bytes memory) {
        // If the interval has passed
        if (block.timestamp - s_lastUpkeep > s_upkeepInterval) {
            // Check which contributions need to be sent
            DACContributorLibrary.ContributionMinimal[]
                memory contributionsToSend = calculateContributions();

            // If at least one contribution to a project is still active
            if (contributionsToSend.length > 0) {
                // Encode the array to bytes
                bytes memory data = abi.encode(contributionsToSend);

                // Return true to trigger the upkeep, along with the array of contributions as bytes
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

        // Decode the array of contributions to send
        DACContributorLibrary.ContributionMinimal[]
            memory contributionsToSend = abi.decode(
                performData,
                (DACContributorLibrary.ContributionMinimal[])
            );

        // Send the contributions
        transferContributions(contributionsToSend);
    }

    /* -------------------------------------------------------------------------- */
    /*                                   SETTERS                                  */
    /* -------------------------------------------------------------------------- */

    /**
     * @notice Set the interval between each upkeep
     * @param _interval The interval between each upkeep
     * @dev The value should be between 1 day and 30 days
     */

    function setUpkeepInterval(uint256 _interval) external onlyOwner {
        if (_interval < 1 days || _interval > 30 days)
            revert DACContributorAccount__INVALID_UPKEEP_INTERVAL();

        s_upkeepInterval = _interval;
        emit DACContributorAccount__UpkeepIntervalUpdated(_interval);
    }

    /* -------------------------------------------------------------------------- */
    /*                                   GETTERS                                  */
    /* -------------------------------------------------------------------------- */

    /**
     * @dev Get the address of the LINK token contract
     * @return address The address of the contract
     */

    function getLink() external view returns (address) {
        return address(LINK);
    }

    /**
     * @notice Get the address of the Upkeep registry
     * @return address The address of the contract
     */

    function getUpkeepRegistry() external view returns (address) {
        return address(REGISTRY);
    }

    /**
     * @notice Get the address of the Upkeep registrar
     * @return address The address of the contract
     */

    function getUpkeepRegistrar() external view returns (address) {
        return address(REGISTRAR);
    }

    /**
     * @notice Get the address of the DAC Aggregator
     * @return address The address of the contract
     */

    function getDACAggregator() external view returns (address) {
        return address(DAC_AGGREGATOR);
    }

    /**
     * @notice Get the address of the owner of the account
     * @return address The address of the owner of the account
     */

    function getOwner() external view returns (address) {
        return i_owner;
    }

    /**
     * @notice Get the creation date of the account
     * @return uint256 The creation date of the account
     */

    function getCreatedAt() external view returns (uint256) {
        return i_createdAt;
    }

    /**
     * @notice Get the maximum amount of contributions that this account can hold
     * @return uint256 The maximum amount of contributions
     */

    function getMaxContributions() external view returns (uint256) {
        return i_maxContributions;
    }

    /**
     * @notice Get the last time the contributions were sent to the supported projects though the upkeep
     * @return uint256 The timestamp of the last upkeep
     */

    function getLastUpkeep() external view returns (uint256) {
        return s_lastUpkeep;
    }

    /**
     * @notice Get the interval between each upkeep
     * @return uint256 The timestamp of the interval between each upkeep
     */

    function getUpkeepInterval() external view returns (uint256) {
        return s_upkeepInterval;
    }

    /**
     * @notice Get the contributions of the account
     * @return array The contributions of the account
     */

    function getContributions()
        external
        view
        returns (DACContributorLibrary.Contribution[] memory)
    {
        return s_contributions;
    }

    /**
     * @notice Get the Chainlink Upkeep ID
     * @return uint256 The Chainlink Upkeep ID
     */

    function getUpkeepId() external view returns (uint256) {
        return s_upkeepId;
    }

    /**
     * @notice Get the Chainlink Upkeep registered status
     * @return bool Whether the Chainlink Upkeep is registered or not
     */

    function isUpkeepRegistered() external view returns (bool) {
        return s_upkeepRegistered;
    }

    /**
     * @notice Calculate the overall amount of the contributions that should be sent
     * @return array The contributions that should be sent
     */

    function calculateContributions()
        internal
        view
        returns (DACContributorLibrary.ContributionMinimal[] memory)
    {
        // Cache the contributions
        DACContributorLibrary.Contribution[]
            memory contributions = s_contributions;
        // Prepare the array to hold the contributions that need to be sent
        DACContributorLibrary.ContributionMinimal[]
            memory contributionsToSend = new DACContributorLibrary.ContributionMinimal[](
                contributions.length
            );
        // And the number of contributions that need to be sent
        uint256 contributionsToSendCount = 0;

        for (uint256 i = 0; i < contributions.length; ) {
            // If the project is still active and there are still some funds to send
            if (
                isProjectStillActive(contributions[i].projectContract) &&
                isContributionAlreadyDistributed(contributions[i])
            ) {
                // Calculate the amount of the contribution that can be sent based on the time left
                uint256 amountToSend = calculateIndividualContribution(
                    contributions[i]
                );

                // If the amount to send is not 0
                if (amountToSend > 0) {
                    // Add the contribution to the array
                    contributionsToSend[
                        contributionsToSendCount
                    ] = DACContributorLibrary.ContributionMinimal({
                        projectContract: contributions[i].projectContract,
                        amount: amountToSend,
                        index: i
                    });
                    unchecked {
                        contributionsToSendCount++;
                    }
                }
            }

            unchecked {
                i++;
            }
        }

        // Shrink the array to the correct size
        assembly {
            mstore(contributionsToSend, contributionsToSendCount)
        }

        return contributionsToSend;
    }

    /**
     * @notice Get the amount of a contribution that should be sent based on the date
     * @param _contribution The contribution to check
     * @return uint256 The amount of the contribution that should be sent
     * @dev This will not check if the contribution is still active or not, so it should be done before calling this function
     */

    function calculateIndividualContribution(
        DACContributorLibrary.Contribution memory _contribution
    ) internal view returns (uint256) {
        // If there is nothing to distribute anymore, return 0
        if (_contribution.amountStored == 0) return 0;

        // If the contribution period has ended, return the amount that is left
        if (_contribution.endsAt < block.timestamp)
            return _contribution.amountStored - _contribution.amountDistributed;

        // Calculate the amount of the contribution that should be sent based on the time left
        uint256 remainingDuration = _contribution.endsAt - block.timestamp;
        uint256 remainingIntervals = remainingDuration / s_upkeepInterval;
        uint256 remainingAmount = _contribution.amountStored -
            _contribution.amountDistributed;

        // Calculate the amount to distribute based on the remaining intervals.
        // If there's an incomplete interval, it will be counted as a whole one.
        return remainingAmount / (remainingIntervals + 2); // "+1" for rounding up
        // and "+1" for the incomplete interval (we want a payment at the end of the period)
    }

    /**
     * @notice Know if the project is still active or not
     * @param _projectContract The address of the project contract
     * @return bool Whether the project is still active or not
     */

    function isProjectStillActive(
        address _projectContract
    ) internal view returns (bool) {
        return DAC_AGGREGATOR.isProjectActive(_projectContract);
    }

    /**
     * @notice Know if the contribution is still active or not
     * @param _contribution The contribution to check
     * @return bool Whether the contribution is still active or not
     */

    function isContributionAlreadyDistributed(
        DACContributorLibrary.Contribution memory _contribution
    ) internal pure returns (bool) {
        if (_contribution.amountStored > _contribution.amountDistributed)
            return true;

        return false;
    }
}
