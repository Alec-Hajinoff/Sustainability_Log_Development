// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract SustainabilityLog {
    event SustainabilityActionPublished(
        address indexed sender,
        bytes32 indexed actionHash,
        uint256 indexed timestamp
    );

    function publishSustainabilityAction(
        bytes32 actionHash,
        uint256 timestamp
    ) external {
        emit SustainabilityActionPublished(msg.sender, actionHash, timestamp);
    }
}
