// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "./ChainlinkManager.sol";

/**
 * @title DAC (Decentralized Autonomous Crowdfunding) Contributor account
 * @author polarzero
 * @notice ...
 */

contract DACContributorAccount {
    LinkTokenInterface internal immutable LINK;
    KeeperRegistrarInterface internal immutable REGISTRAR;
    KeeperRegistryInterface internal immutable REGISTRY;

    /* -------------------------------------------------------------------------- */
    /*                                CUSTOM ERRORS                               */
    /* -------------------------------------------------------------------------- */

    /// @dev This function can only be called by the owner of the account
    error DACContributorAccount__NOT_OWNER();
    /// @dev The transfer failed
    error DACContributorAccount__TRANSFER_FAILED();
    /// @dev The call to an external contract failed
    error DACContributorAccount__CALL_FAILED();
    /// @dev The contribution is not active anymore
    error DACContributorAccount__CONTRIBUTION_NOT_ACTIVE();
    /// @dev The project is not active anymore
    error DACContributorAccount__PROJECT_NOT_ACTIVE();
    /// @dev The amount sent is not correct
    error DACContributorAccount__INCORRECT_AMOUNT();
    /// @dev The amount sent is higher than the maximum amount of contributions
    error DACContributorAccount__TOO_MANY_CONTRIBUTIONS();
    /// @dev The timestamp is in the past
    error DACContributorAccount__INVALID_TIMESTAMP();

    /* -------------------------------------------------------------------------- */
    /*                                   EVENTS                                   */
    /* -------------------------------------------------------------------------- */

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
    uint256 private i_upkeepId;

    /// @dev The last time the contributions were sent to the supported projects though the upkeep
    uint256 private s_lastUpkeep;
    /// @dev The interval between each payment
    // The owner of the account can change this value, knowing that a smaller value will require more LINK
    uint256 private s_upkeepInterval;

    /// @dev The projects the account is contributing to
    Contribution[] private s_contributions;

    /// @dev The status and infos of a contribution
    /// @param projectContract The address of the project contract
    /// @param amountStored The amount of the contribution stored in the account
    /// @param amountDistributed The amount of the contribution that was already sent to the project
    /// @param startedAt The timestamp when the contribution started
    /// @param endsAt The timestamp when the contribution ends
    struct Contribution {
        address projectContract;
        uint256 amountStored;
        uint256 amountDistributed;
        uint256 startedAt;
        uint256 endsAt;
    }

    /// @dev The minimal infos of a contribution to prepare the upkeep
    /// @param projectContract The address of the project contract
    /// @param amount The amount of the contribution that should be sent (based on the current date, start and end date)
    struct ContributionMinimal {
        address projectContract;
        uint256 amount;
    }

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
     * @param _maxContributions The maximum amount of contributions that can be stored in the account
     * @param _upkeepGasLimit The gas limit for the Chainlink Upkeep
     * @dev This will register a new Chainlink Upkeep in the fly
     */
    constructor(
        address _owner,
        address _linkToken,
        address _registrar,
        address _registry,
        uint256 _maxContributions,
        uint256 _upkeepGasLimit
    ) {
        // Initialize the owner and the creation date
        i_owner = _owner;
        i_createdAt = block.timestamp;
        i_maxContributions = _maxContributions;

        // Initialize storage variables
        s_lastUpkeep = block.timestamp;

        // Initialize the Chainlink variables
        LINK = LinkTokenInterface(_linkToken);
        REGISTRAR = KeeperRegistrarInterface(_registrar);
        REGISTRY = KeeperRegistryInterface(_registry);

        // Register a new Chainlink Upkeep
        i_upkeepId = REGISTRAR.registerUpkeep(
            RegistrationParams({
                name: "DACContributorAccount",
                upkeepContract: address(this),
                gasLimit: _upkeepGasLimit,
                adminAddress: _owner,
                checkData: "0x",
                offchainConfig: "0x",
                amount: 0
            })
        );
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
        if (_amount > i_maxContributions)
            revert DACContributorAccount__TOO_MANY_CONTRIBUTIONS();

        // Check if the end date is not in the past
        if (_endDate < block.timestamp)
            revert DACContributorAccount__INVALID_TIMESTAMP();

        // Create the contribution
        s_contributions.push(
            Contribution({
                projectContract: _projectContract,
                amountStored: _amount,
                amountDistributed: 0,
                startedAt: block.timestamp,
                endsAt: _endDate
            })
        );
    }

    /**
     * @notice Increase the amount of a contribution
     * @param _index The index of the contribution in the array
     * @param _amount The new amount
     */

    function increaseContribution(
        uint256 _index,
        uint256 _amount
    ) external payable onlyOwner {
        Contribution memory contribution = s_contributions[_index];
        // Check if the contribution is still active
        if (!isContributionActive(contribution))
            revert DACContributorAccount__CONTRIBUTION_NOT_ACTIVE();
        // Check that the amount sent is correct
        if (msg.value != _amount)
            revert DACContributorAccount__INCORRECT_AMOUNT();

        // Increase the amount of the contribution
        s_contributions[_index].amountStored += _amount;
    }

    /**
     * @notice Decrease the amount of a contribution
     * @param _index The index of the contribution in the array
     * @param _amount The new amount
     */

    function decreaseContribution(
        uint256 _index,
        uint256 _amount
    ) external onlyOwner {
        Contribution memory contribution = s_contributions[_index];
        // Check if the contribution is still active
        if (!isContributionActive(contribution))
            revert DACContributorAccount__CONTRIBUTION_NOT_ACTIVE();

        // Check that the amount is not higher than the amount of the contribution
        if (
            _amount > contribution.amountStored - contribution.amountDistributed
        ) revert DACContributorAccount__INCORRECT_AMOUNT();

        // Decrease the amount of the contribution
        s_contributions[_index].amountStored -= _amount;

        // Withdraw the amount of the contribution
        (bool success, ) = msg.sender.call{value: _amount}("");
        if (!success) revert DACContributorAccount__TRANSFER_FAILED();
    }

    /**
     * @notice Cancel a contribution and withdraw the funds
     * @param _index The index of the contribution in the array
     */

    function cancelContribution(uint256 _index) external onlyOwner {
        Contribution memory contribution = s_contributions[_index];
        // Check if the contribution is still active
        if (!isContributionActive(contribution))
            revert DACContributorAccount__CONTRIBUTION_NOT_ACTIVE();

        // Withdraw the amount of the contribution
        (bool success, ) = msg.sender.call{
            value: contribution.amountStored - contribution.amountDistributed
        }("");
        if (!success) revert DACContributorAccount__TRANSFER_FAILED();

        // Remove the contribution from the array
        delete s_contributions[_index];
    }

    /**
     * @notice Cancel all the contributions and withdraw the funds
     */

    function cancelAllContributions() external onlyOwner {
        Contribution[] memory contributions = s_contributions;

        // For each contribution
        for (uint256 i = 0; i < contributions.length; i++) {
            // Set the distributed amount to the total amount
            s_contributions[i].amountDistributed = contributions[i]
                .amountStored;
        }

        // Withdraw everything from this contract
        (bool success, ) = msg.sender.call{value: address(this).balance}("");
        if (!success) revert DACContributorAccount__TRANSFER_FAILED();
    }

    /**
     * @notice Withdraw LINK tokens from this contract
     */

    function withdrawLink() external onlyOwner {
        bool success = LINK.transfer(msg.sender, LINK.balanceOf(address(this)));
        if (!success) revert DACContributorAccount__TRANSFER_FAILED();
    }

    /**
     * @notice Trigger the payment of all the contributions manually
     * @dev This can be called by the owner of the account if the Chainlink Upkeeps failed,
     * or just if they want to trigger the payment manually at any time
     */

    function triggerManualPayment() external onlyOwner {
        // Check which contributions need to be sent
        ContributionMinimal[]
            memory contributionsToSend = calculateContributions();

        // If at least one project is still active
        if (contributionsToSend.length > 0) {
            // Send the contributions
            transferContributions(contributionsToSend);
        }

        // Update the timestamp of the last upkeep
        s_lastUpkeep = block.timestamp;
    }

    /**
     * @notice Send the contributions to the projects
     * @param _contributionsToSend The contributions to send
     */

    function transferContributions(
        ContributionMinimal[] memory _contributionsToSend
    ) internal {
        // For each contribution
        for (uint256 i = 0; i < _contributionsToSend.length; i++) {
            // Send the contribution
            (bool success, ) = _contributionsToSend[i].projectContract.call{
                value: _contributionsToSend[i].amount
            }("");

            if (!success) revert DACContributorAccount__CALL_FAILED();
        }
    }

    /* -------------------------------------------------------------------------- */
    /*                                   UPKEEP                                   */
    /* -------------------------------------------------------------------------- */

    /**
     * @notice Fund the upkeep of the account
     */

    function fundUpkeep() external onlyOwner {
        // Add funds to the Chainlink Upkeep
        REGISTRY.addFunds(i_upkeepId, LINK.balanceOf(address(this)));
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
            ContributionMinimal[]
                memory contributionsToSend = calculateContributions();

            // If at least one project is still active
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
        address[] memory contributionsToSend = abi.decode(
            performData,
            (Contribution[])
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
     */

    function setUpkeepInterval(uint256 _interval) external onlyOwner {
        s_upkeepInterval = _interval;
    }

    /* -------------------------------------------------------------------------- */
    /*                                   GETTERS                                  */
    /* -------------------------------------------------------------------------- */

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

    function getContributions() external view returns (Contribution[] memory) {
        return s_contributions;
    }

    /**
     * @notice Calculate if the contract holds enough LINK to process the next upkeep
     * @return bool Whether the contract can process the next upkeep or not
     * @dev It will be based on the maximum price it could cost with a maximum gas price
     */

    function hasEnoughLinkForNextUpkeep() external view returns (bool) {
        // Calculate the amount of LINK needed for the next upkeep
        uint256 amountNeeded = calculateAmountNeededForNextUpkeep();

        // If the contract holds enough LINK, return true
        if (LINK.balanceOf(address(this)) >= amountNeeded) return true;

        // If the contract doesn't hold enough LINK, return false
        return false;
    }

    /**
     * @notice Calculate the overall amount of the contributions that should be sent
     * @return array The contributions that should be sent
     */

    function calculateContributions() internal returns (Contribution[] memory) {
        // Cache the contributions
        Contribution[] memory contributions = s_contributions;
        // Prepare the array to hold the contributions that need to be sent
        ContributionMinimal[] memory contributionsToSend;

        for (uint256 i = 0; i < contributions.length; i++) {
            // If the project is still active and there are still some funds to send
            if (
                isProjectStillActive(contributions[i].projectContract) &&
                isContributionActive(contributions[i])
            ) {
                // Calculate the amount of the contribution that can be sent based on the time left
                uint256 amountToSend = calculateIndividualContribution(
                    contributions[i]
                );

                // If the amount to send is not 0
                if (amountToSend > 0) {
                    // Add the contribution to the array
                    contributionsToSend.push(
                        ContributionMinimal({
                            projectContract: contributions[i].projectContract,
                            amount: amountToSend
                        })
                    );
                }
            }
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
        Contribution memory _contribution
    ) internal view returns (uint256) {
        // If there is nothing to distribute anymore, return 0
        if (_contribution.amountStored == 0) return 0;

        // If the contribution period has ended, return the amount that is left
        if (_contribution.endsAt < block.timestamp)
            return _contribution.amountStored - _contribution.amountDistributed;

        // Calculate the amount of the contribution that should be sent based on the time left
        uint256 remainingDuration = _contribution.endDate - block.timestamp;
        uint256 remainingIntervals = remainingDuration / s_upkeepInterval;
        uint256 remainingAmount = _contribution.amountStored -
            _contribution.amountDistributed;

        // Calculate the amount to distribute based on the remaining intervals.
        // If there's an incomplete interval, it will be counted as a whole one.
        return remainingAmount / (remainingIntervals + 1); // "+1" for rounding up
    }

    /**
     * @notice Know if the contribution is still active or not
     * @param _contribution The contribution to check
     * @return bool Whether the contribution is still active or not
     */

    function isContributionActive(
        Contribution memory _contribution
    ) internal view returns (bool) {
        if (_contribution.amount > _contribution.amountDistributed) return true;

        return false;
    }

    /**
     * @notice Know if the project is still active or not
     * @param _projectContract The address of the project contract
     * @return bool Whether the project is still active or not
     */

    function isProjectStillActive(
        address _projectContract
    ) internal view returns (bool) {
        (bool success, bytes memory data) = _projectContract.staticcall(
            abi.encodeWithSignature("isActive()")
        );
        if (!success) revert DACContributorAccount__CALL_FAILED();

        return abi.decode(data, (bool));
    }
}
