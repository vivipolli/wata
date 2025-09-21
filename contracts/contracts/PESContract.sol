// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract PESContract {
    struct Agreement {
        bytes32 agreementHash;
        address producer;
        uint256 baseValue;
        uint256 hectares;
        bool isActive;
        uint256 createdAt;
    }

    mapping(uint256 => Agreement) public agreements;
    uint256 public agreementCounter;

    address public owner;
    address public relayer;

    event AgreementCreated(
        uint256 indexed agreementId,
        bytes32 indexed agreementHash,
        address indexed producer,
        uint256 baseValue,
        uint256 hectares
    );

    event PaymentRequested(
        uint256 indexed agreementId,
        address indexed producer,
        uint256 amount,
        bytes32 indexed auditHash
    );

    event AuditRecorded(bytes32 indexed auditHash, uint256 timestamp);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    modifier onlyRelayer() {
        require(msg.sender == relayer, "Only relayer can call this function");
        _;
    }

    constructor() {
        owner = msg.sender;
        relayer = msg.sender;
    }

    function setRelayer(address _relayer) external onlyOwner {
        relayer = _relayer;
    }

    function createAgreement(
        bytes32 _agreementHash,
        address _producer,
        uint256 _baseValue,
        uint256 _hectares
    ) external onlyOwner returns (uint256) {
        require(_producer != address(0), "Invalid producer address");
        require(_baseValue > 0, "Base value must be greater than 0");
        require(_hectares > 0, "Hectares must be greater than 0");

        uint256 agreementId = agreementCounter++;

        agreements[agreementId] = Agreement({
            agreementHash: _agreementHash,
            producer: _producer,
            baseValue: _baseValue,
            hectares: _hectares,
            isActive: true,
            createdAt: block.timestamp
        });

        emit AgreementCreated(
            agreementId,
            _agreementHash,
            _producer,
            _baseValue,
            _hectares
        );

        return agreementId;
    }

    function requestPayment(
        uint256 _agreementId,
        bytes32 _auditHash
    ) external onlyRelayer {
        require(_agreementId < agreementCounter, "Agreement does not exist");
        Agreement storage agreement = agreements[_agreementId];
        require(agreement.isActive, "Agreement is not active");

        uint256 paymentAmount = agreement.baseValue * agreement.hectares;

        emit PaymentRequested(
            _agreementId,
            agreement.producer,
            paymentAmount,
            _auditHash
        );
    }

    function recordAudit(bytes32 _auditHash) external onlyRelayer {
        emit AuditRecorded(_auditHash, block.timestamp);
    }

    function getAgreement(
        uint256 _agreementId
    )
        external
        view
        returns (
            bytes32 agreementHash,
            address producer,
            uint256 baseValue,
            uint256 hectares,
            bool isActive,
            uint256 createdAt
        )
    {
        require(_agreementId < agreementCounter, "Agreement does not exist");
        Agreement storage agreement = agreements[_agreementId];

        return (
            agreement.agreementHash,
            agreement.producer,
            agreement.baseValue,
            agreement.hectares,
            agreement.isActive,
            agreement.createdAt
        );
    }

    function deactivateAgreement(uint256 _agreementId) external onlyOwner {
        require(_agreementId < agreementCounter, "Agreement does not exist");
        agreements[_agreementId].isActive = false;
    }
}
