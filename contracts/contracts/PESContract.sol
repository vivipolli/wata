// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "./OracleManager.sol";

contract PESContract {
    enum GovernanceMode {
        AUTO, // Automatic payment approval (default for hackathon)
        HYBRID_SIMPLE, // Requires financial manager approval
        HYBRID_FULL // Requires both technical and financial manager approval
    }

    struct Agreement {
        bytes32 agreementHash;
        address producer;
        address investor;
        uint256 baseValue;
        uint256 hectares;
        bool isActive;
        uint256 createdAt;
        uint256 lastScore;
        bytes32 lastAuditHash;
        uint256 lastUpdateTimestamp;
        GovernanceMode governanceMode;
        uint256 totalInvested;
        uint256 totalPaid;
    }

    struct PaymentRecord {
        uint256 agreementId;
        address producer;
        address investor;
        uint256 amount;
        bytes32 auditHash;
        uint256 score;
        uint256 timestamp;
        string hcsTransactionId;
        string hfsFileId;
    }

    mapping(uint256 => Agreement) public agreements;
    mapping(uint256 => PaymentRecord) public payments;
    uint256 public agreementCounter;
    uint256 public paymentCounter;

    address public owner;
    address public relayer;
    address public financialManager; // For HYBRID modes
    address public technicalManager; // For HYBRID_FULL mode
    OracleManager public oracleManager;

    uint256 public constant SCORE_THRESHOLD = 70; // 0.7 * 100 for precision (score is 0-1 * 100, 0.7 = 70%)

    event AgreementCreated(
        uint256 indexed agreementId,
        bytes32 indexed agreementHash,
        address indexed producer,
        address investor,
        uint256 baseValue,
        uint256 hectares,
        GovernanceMode governanceMode
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
        bytes32 indexed auditHash,
        address investor,
        uint256 amount,
        uint256 score,
        string hcsTransactionId,
        string hfsFileId
    );

    event PaymentRequested(
        uint256 indexed agreementId,
        address indexed producer,
        uint256 amount,
        bytes32 indexed auditHash
    );

    event AuditRecorded(bytes32 indexed auditHash, uint256 timestamp);

    event InvestmentReceived(
        uint256 indexed agreementId,
        address indexed investor,
        uint256 amount,
        uint256 totalInvested
    );

    event PaymentExecuted(
        uint256 indexed paymentId,
        uint256 indexed agreementId,
        address indexed producer,
        uint256 amount,
        string hcsTransactionId,
        string hfsFileId
    );

    event AuditRecordedV3(
        bytes32 indexed auditHash,
        uint256 timestamp,
        string hcsTransactionId,
        string hfsFileId
    );

    event GovernanceModeChanged(
        uint256 indexed agreementId,
        GovernanceMode oldMode,
        GovernanceMode newMode
    );

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    modifier onlyRelayer() {
        require(msg.sender == relayer, "Only relayer can call this function");
        _;
    }

    modifier onlyFinancialManager() {
        require(
            msg.sender == financialManager,
            "Only financial manager can call this function"
        );
        _;
    }

    modifier onlyTechnicalManager() {
        require(
            msg.sender == technicalManager,
            "Only technical manager can call this function"
        );
        _;
    }

    constructor(address _oracleManager) {
        owner = msg.sender;
        relayer = msg.sender;
        financialManager = msg.sender;
        technicalManager = msg.sender;
        oracleManager = OracleManager(_oracleManager);
    }

    function setRelayer(address _relayer) external onlyOwner {
        relayer = _relayer;
    }

    function setFinancialManager(address _financialManager) external onlyOwner {
        financialManager = _financialManager;
    }

    function setTechnicalManager(address _technicalManager) external onlyOwner {
        technicalManager = _technicalManager;
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
            investor: address(0),
            baseValue: _baseValue,
            hectares: _hectares,
            isActive: true,
            createdAt: block.timestamp,
            lastScore: 0,
            lastAuditHash: bytes32(0),
            lastUpdateTimestamp: 0,
            governanceMode: GovernanceMode.AUTO, // Default to AUTO for hackathon
            totalInvested: 0,
            totalPaid: 0
        });

        emit AgreementCreated(
            agreementId,
            _agreementHash,
            _producer,
            address(0),
            _baseValue,
            _hectares,
            GovernanceMode.AUTO
        );

        return agreementId;
    }

    function createAgreementWithInvestor(
        bytes32 _agreementHash,
        address _producer,
        address _investor,
        uint256 _baseValue,
        uint256 _hectares,
        GovernanceMode _governanceMode
    ) external onlyOwner returns (uint256) {
        require(_producer != address(0), "Invalid producer address");
        require(_investor != address(0), "Invalid investor address");
        require(_baseValue > 0, "Base value must be greater than 0");
        require(_hectares > 0, "Hectares must be greater than 0");

        uint256 agreementId = agreementCounter++;

        agreements[agreementId] = Agreement({
            agreementHash: _agreementHash,
            producer: _producer,
            investor: _investor,
            baseValue: _baseValue,
            hectares: _hectares,
            isActive: true,
            createdAt: block.timestamp,
            lastScore: 0,
            lastAuditHash: bytes32(0),
            lastUpdateTimestamp: 0,
            governanceMode: _governanceMode,
            totalInvested: 0,
            totalPaid: 0
        });

        emit AgreementCreated(
            agreementId,
            _agreementHash,
            _producer,
            _investor,
            _baseValue,
            _hectares,
            _governanceMode
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
        require(
            _score <= 100,
            "Score must be between 0 and 100 (0-1 normalized, 0.7 = 70%)"
        );

        Agreement storage agreement = agreements[_agreementId];
        require(agreement.isActive, "Agreement is not active");

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

        // Handle payment based on governance mode
        if (_score >= SCORE_THRESHOLD) {
            uint256 paymentAmount = agreement.baseValue * agreement.hectares;

            // Emit updated PaymentApproved event
            emit PaymentApproved(
                _agreementId,
                agreement.producer,
                _auditHash,
                agreement.investor,
                paymentAmount,
                _score,
                "", // hcsTransactionId - will be set by relayer
                "" // hfsFileId - will be set by relayer
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

    function investInAgreement(uint256 _agreementId) external payable {
        require(_agreementId < agreementCounter, "Agreement does not exist");
        Agreement storage agreement = agreements[_agreementId];
        require(agreement.isActive, "Agreement is not active");
        require(msg.value > 0, "Investment amount must be greater than 0");

        // If no investor is set, set the first investor
        if (agreement.investor == address(0)) {
            agreement.investor = msg.sender;
        }

        agreement.totalInvested += msg.value;

        emit InvestmentReceived(
            _agreementId,
            msg.sender,
            msg.value,
            agreement.totalInvested
        );
    }

    function executePayment(
        uint256 _agreementId,
        uint256 _amount,
        bytes32 _auditHash,
        uint256 _score,
        string memory _hcsTransactionId,
        string memory _hfsFileId
    ) external onlyRelayer {
        require(_agreementId < agreementCounter, "Agreement does not exist");
        Agreement storage agreement = agreements[_agreementId];
        require(agreement.isActive, "Agreement is not active");

        uint256 paymentId = paymentCounter++;

        payments[paymentId] = PaymentRecord({
            agreementId: _agreementId,
            producer: agreement.producer,
            investor: agreement.investor,
            amount: _amount,
            auditHash: _auditHash,
            score: _score,
            timestamp: block.timestamp,
            hcsTransactionId: _hcsTransactionId,
            hfsFileId: _hfsFileId
        });

        agreement.totalPaid += _amount;

        emit PaymentExecuted(
            paymentId,
            _agreementId,
            agreement.producer,
            _amount,
            _hcsTransactionId,
            _hfsFileId
        );
    }

    function changeGovernanceMode(
        uint256 _agreementId,
        GovernanceMode _newMode
    ) external onlyOwner {
        require(_agreementId < agreementCounter, "Agreement does not exist");
        Agreement storage agreement = agreements[_agreementId];

        GovernanceMode oldMode = agreement.governanceMode;
        agreement.governanceMode = _newMode;

        emit GovernanceModeChanged(_agreementId, oldMode, _newMode);
    }

    function recordAuditV3(
        bytes32 _auditHash,
        string memory _hcsTransactionId,
        string memory _hfsFileId
    ) external onlyRelayer {
        emit AuditRecordedV3(
            _auditHash,
            block.timestamp,
            _hcsTransactionId,
            _hfsFileId
        );
    }

    // Receive function to accept HBAR investments
    receive() external payable {
        // This allows the contract to receive HBAR directly
        // In a real implementation, you'd need to track which agreement this is for
    }

    // Function to withdraw excess HBAR (only owner)
    function withdrawExcessHBAR(uint256 _amount) external onlyOwner {
        require(_amount <= address(this).balance, "Insufficient balance");
        payable(owner).transfer(_amount);
    }

    function getAgreement(
        uint256 _agreementId
    )
        external
        view
        returns (
            bytes32 agreementHash,
            address producer,
            address investor,
            uint256 baseValue,
            uint256 hectares,
            bool isActive,
            uint256 createdAt,
            uint256 lastScore,
            bytes32 lastAuditHash,
            uint256 lastUpdateTimestamp,
            GovernanceMode governanceMode,
            uint256 totalInvested,
            uint256 totalPaid
        )
    {
        require(_agreementId < agreementCounter, "Agreement does not exist");
        Agreement storage agreement = agreements[_agreementId];

        return (
            agreement.agreementHash,
            agreement.producer,
            agreement.investor,
            agreement.baseValue,
            agreement.hectares,
            agreement.isActive,
            agreement.createdAt,
            agreement.lastScore,
            agreement.lastAuditHash,
            agreement.lastUpdateTimestamp,
            agreement.governanceMode,
            agreement.totalInvested,
            agreement.totalPaid
        );
    }

    function getPaymentRecord(
        uint256 _paymentId
    )
        external
        view
        returns (
            uint256 agreementId,
            address producer,
            address investor,
            uint256 amount,
            bytes32 auditHash,
            uint256 score,
            uint256 timestamp,
            string memory hcsTransactionId,
            string memory hfsFileId
        )
    {
        require(_paymentId < paymentCounter, "Payment does not exist");
        PaymentRecord storage payment = payments[_paymentId];

        return (
            payment.agreementId,
            payment.producer,
            payment.investor,
            payment.amount,
            payment.auditHash,
            payment.score,
            payment.timestamp,
            payment.hcsTransactionId,
            payment.hfsFileId
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
