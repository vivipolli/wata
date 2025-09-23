// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract OracleManager {
    address public owner;
    mapping(address => bool) public authorizedOracles;
    address[] public oraclesList;

    event OracleAuthorized(address indexed oracle, uint256 timestamp);
    event OracleRevoked(address indexed oracle, uint256 timestamp);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    modifier onlyAuthorizedOracle() {
        require(
            authorizedOracles[msg.sender],
            "Only authorized oracle can call this function"
        );
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function authorizeOracle(address oracle) external onlyOwner {
        require(oracle != address(0), "Invalid oracle address");
        require(!authorizedOracles[oracle], "Oracle already authorized");

        authorizedOracles[oracle] = true;
        oraclesList.push(oracle);

        emit OracleAuthorized(oracle, block.timestamp);
    }

    function revokeOracle(address oracle) external onlyOwner {
        require(authorizedOracles[oracle], "Oracle not authorized");

        authorizedOracles[oracle] = false;

        // Remove from oraclesList
        for (uint256 i = 0; i < oraclesList.length; i++) {
            if (oraclesList[i] == oracle) {
                oraclesList[i] = oraclesList[oraclesList.length - 1];
                oraclesList.pop();
                break;
            }
        }

        emit OracleRevoked(oracle, block.timestamp);
    }

    function isAuthorizedOracle(address oracle) external view returns (bool) {
        return authorizedOracles[oracle];
    }

    function getAuthorizedOracles() external view returns (address[] memory) {
        return oraclesList;
    }

    function getOracleCount() external view returns (uint256) {
        return oraclesList.length;
    }
}
