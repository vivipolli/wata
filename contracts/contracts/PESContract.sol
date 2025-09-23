// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "./OracleManager.sol";

contract PESContract {
    struct Agreement {
        bytes32 agreementHash;
        address producer;
        uint256 baseValue;
        uint256 hectares;
        bool isActive;
        uint256 createdAt;
        uint256 lastScore;
        bytes32 lastAuditHash;
        uint256 lastUpdateTimestamp;
    }

    mapping(uint256 => Agreement) public agreements;
    uint256 public agreementCounter;

    address public owner;
    address public relayer;
    OracleManager public oracleManager;

    uint256 public constant SCORE_THRESHOLD = 70; // 0.7 * 100 for precision

    event AgreementCreated(
        uint256 indexed agreementId,
        bytes32 indexed agreementHash,
        address indexed producer,
        uint256 baseValue,
        uint256 hectares
    );

    event ValidatedBatchSubmitted(
        uint256 indexed agreementId,
        address indexed oracle,
        bytes32 indexed auditHash,
        uint256 score,
        uint256 timestamp
    );

    event PaymentApproved(
        uint256 indexed agreementId,
        address indexed producer,
        uint256 amount,
        bytes32 indexed auditHash,
        uint256 score
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

    constructor(address _oracleManager) {
        owner = msg.sender;
        relayer = msg.sender;
        oracleManager = OracleManager(_oracleManager);
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
            createdAt: block.timestamp,
            lastScore: 0,
            lastAuditHash: bytes32(0),
            lastUpdateTimestamp: 0
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

    function submitValidatedBatch(
        uint256 _agreementId,
        bytes32 _auditHash,
        uint256 _score
    ) external {
        require(
            oracleManager.isAuthorizedOracle(msg.sender),
            "Only authorized oracle can submit batch"
        );
        require(_agreementId < agreementCounter, "Agreement does not exist");
        require(_score <= 100, "Score must be between 0 and 100");

        Agreement storage agreement = agreements[_agreementId];
        require(agreement.isActive, "Agreement is not active");

        // Update agreement with new score and audit hash
        agreement.lastScore = _score;
        agreement.lastAuditHash = _auditHash;
        agreement.lastUpdateTimestamp = block.timestamp;

        emit ValidatedBatchSubmitted(
            _agreementId,
            msg.sender,
            _auditHash,
            _score,
            block.timestamp
        );

        // If score meets threshold, approve payment
        if (_score >= SCORE_THRESHOLD) {
            uint256 paymentAmount = agreement.baseValue * agreement.hectares;
            emit PaymentApproved(
                _agreementId,
                agreement.producer,
                paymentAmount,
                _auditHash,
                _score
            );
        }
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
            uint256 createdAt,
            uint256 lastScore,
            bytes32 lastAuditHash,
            uint256 lastUpdateTimestamp
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
            agreement.createdAt,
            agreement.lastScore,
            agreement.lastAuditHash,
            agreement.lastUpdateTimestamp
        );
    }

    function getAgreementScore(
        uint256 _agreementId
    ) external view returns (uint256) {
        require(_agreementId < agreementCounter, "Agreement does not exist");
        return agreements[_agreementId].lastScore;
    }

    function setOracleManager(address _oracleManager) external onlyOwner {
        oracleManager = OracleManager(_oracleManager);
    }

    function deactivateAgreement(uint256 _agreementId) external onlyOwner {
        require(_agreementId < agreementCounter, "Agreement does not exist");
        agreements[_agreementId].isActive = false;
    }
}
