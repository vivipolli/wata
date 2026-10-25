// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

interface IOracleManager {
    function isAuthorizedOracle(address oracle) external view returns (bool);
}

/**
 * @title PESEscrowV3
 * @notice Per-agreement escrow for payment for environmental services. Funds sit in the contract
 * and only leave it to the producer of the agreement that holds them, after an authorized oracle
 * submitted a score and (in HYBRID mode) a financial manager approved it in a second step.
 *
 * Units: every amount is in the native coin's base unit of the network the contract runs on.
 * Whether that is tinybar or 10^-18 HBAR on Hedera depends on the call path and MUST be verified
 * on the target network before any real value is deposited.
 */
contract PESEscrowV3 {
    enum GovernanceMode { AUTO, HYBRID }
    enum PeriodState { None, PendingApproval, Approved, Released, Rejected, InReview, ClosedNoPay }

    struct Agreement {
        address producer;
        address funder;
        uint256 periodAmount;
        uint8 scoreThreshold;
        GovernanceMode mode;
        bool active;
        uint256 deposited;
        uint256 released;
        uint256 refunded;
        uint256 committed;
    }

    struct Period {
        PeriodState state;
        bytes32 auditHash;
        uint8 score;
        uint16 scoreVersion;
        address submitter;
        uint64 approvalDeadline;
    }

    address public admin;
    address public pendingAdmin;
    address public financialManager;
    IOracleManager public oracleManager;
    uint256 public approvalWindow;
    bool public paused;

    uint256 public agreementCount;
    uint256 public totalLiabilities;

    mapping(uint256 => Agreement) private agreements;
    mapping(uint256 => mapping(uint256 => Period)) private periods;
    mapping(bytes32 => bool) public usedAuditHash;
    mapping(address => uint256) public pendingWithdrawals;

    uint256 private reentrancyStatus = 1;

    error NotAdmin();
    error NotOracle();
    error NotFinancialManager();
    error NotPendingAdmin();
    error NotFunder();
    error ZeroAddress();
    error ZeroValue();
    error InvalidParams();
    error AgreementNotFound();
    error AgreementInactive();
    error ScoreOutOfRange();
    error AuditHashUsed();
    error InvalidState();
    error InsufficientFreeBalance();
    error SameAccount();
    error DeadlinePassed();
    error DeadlineNotReached();
    error NothingPending();
    error ExceedsExcess();
    error ExceedsFree();
    error NoFunder();
    error ContractPaused();
    error DirectDepositNotAllowed();
    error Reentrancy();
    error TransferFailed();

    event AgreementCreated(uint256 indexed agreementId, address indexed producer, uint256 periodAmount, uint8 scoreThreshold, GovernanceMode mode);
    event Deposited(uint256 indexed agreementId, address indexed funder, uint256 amount);
    event BatchSubmitted(uint256 indexed agreementId, uint256 indexed periodId, bytes32 auditHash, uint8 score, uint16 scoreVersion, PeriodState state);
    event PeriodApproved(uint256 indexed agreementId, uint256 indexed periodId, address indexed approver);
    event PeriodExpired(uint256 indexed agreementId, uint256 indexed periodId);
    event PeriodRejected(uint256 indexed agreementId, uint256 indexed periodId, address indexed by);
    event PeriodReleased(uint256 indexed agreementId, uint256 indexed periodId, address indexed producer, uint256 amount);
    event PayoutDeferred(address indexed to, uint256 amount);
    event PendingWithdrawn(address indexed to, uint256 amount);
    event ClosedNoPay(uint256 indexed agreementId, uint256 indexed periodId);
    event Refunded(uint256 indexed agreementId, address indexed funder, uint256 amount);
    event ExcessWithdrawn(address indexed to, uint256 amount);
    event AgreementDeactivated(uint256 indexed agreementId);
    event Paused(address indexed by);
    event Unpaused(address indexed by);
    event AdminProposed(address indexed current, address indexed proposed);
    event AdminChanged(address indexed previousAdmin, address indexed newAdmin);
    event FinancialManagerChanged(address indexed previousManager, address indexed newManager);
    event ApprovalWindowChanged(uint256 previousWindow, uint256 newWindow);

    modifier onlyAdmin() {
        if (msg.sender != admin) revert NotAdmin();
        _;
    }

    modifier onlyFinancialManager() {
        if (msg.sender != financialManager) revert NotFinancialManager();
        _;
    }

    modifier whenNotPaused() {
        if (paused) revert ContractPaused();
        _;
    }

    modifier nonReentrant() {
        if (reentrancyStatus != 1) revert Reentrancy();
        reentrancyStatus = 2;
        _;
        reentrancyStatus = 1;
    }

    constructor(address _oracleManager, address _admin, address _financialManager, uint256 _approvalWindow) {
        if (_oracleManager == address(0) || _admin == address(0) || _financialManager == address(0)) revert ZeroAddress();
        if (_approvalWindow == 0) revert InvalidParams();
        oracleManager = IOracleManager(_oracleManager);
        admin = _admin;
        financialManager = _financialManager;
        approvalWindow = _approvalWindow;
    }

    /// @dev HBAR with no agreement attached would be unaccounted balance.
    receive() external payable {
        revert DirectDepositNotAllowed();
    }

    // ---------------------------------------------------------------------------------------
    // Agreements and deposits
    // ---------------------------------------------------------------------------------------

    function createAgreement(
        address producer,
        uint256 periodAmount,
        uint8 scoreThreshold,
        GovernanceMode mode
    ) external onlyAdmin returns (uint256 agreementId) {
        if (producer == address(0)) revert ZeroAddress();
        if (periodAmount == 0 || scoreThreshold == 0 || scoreThreshold > 100) revert InvalidParams();

        agreementId = agreementCount++;
        Agreement storage a = agreements[agreementId];
        a.producer = producer;
        a.periodAmount = periodAmount;
        a.scoreThreshold = scoreThreshold;
        a.mode = mode;
        a.active = true;

        emit AgreementCreated(agreementId, producer, periodAmount, scoreThreshold, mode);
    }

    /// @notice One funder per agreement: the first depositor becomes the funder, nobody else may add funds.
    function deposit(uint256 agreementId) external payable whenNotPaused {
        Agreement storage a = _agreement(agreementId);
        if (!a.active) revert AgreementInactive();
        if (msg.value == 0) revert ZeroValue();
        if (a.funder == address(0)) {
            a.funder = msg.sender;
        } else if (a.funder != msg.sender) {
            revert NotFunder();
        }
        a.deposited += msg.value;
        totalLiabilities += msg.value;
        emit Deposited(agreementId, msg.sender, msg.value);
    }

    function deactivateAgreement(uint256 agreementId) external onlyAdmin {
        _agreement(agreementId).active = false;
        emit AgreementDeactivated(agreementId);
    }

    // ---------------------------------------------------------------------------------------
    // Period lifecycle
    // ---------------------------------------------------------------------------------------

    /// @notice The oracle submits the score for a period. The audit hash can be used only once, ever.
    function submitBatch(
        uint256 agreementId,
        uint256 periodId,
        bytes32 auditHash,
        uint8 score,
        uint16 scoreVersion
    ) external whenNotPaused {
        if (!oracleManager.isAuthorizedOracle(msg.sender)) revert NotOracle();
        Agreement storage a = _agreement(agreementId);
        if (!a.active) revert AgreementInactive();
        if (score > 100) revert ScoreOutOfRange();
        if (usedAuditHash[auditHash]) revert AuditHashUsed();

        Period storage p = periods[agreementId][periodId];
        // A rejected or in-review period may be resubmitted; every other state is final or in flight.
        if (p.state != PeriodState.None && p.state != PeriodState.Rejected && p.state != PeriodState.InReview) {
            revert InvalidState();
        }

        usedAuditHash[auditHash] = true;
        p.auditHash = auditHash;
        p.score = score;
        p.scoreVersion = scoreVersion;
        p.submitter = msg.sender;

        if (score < a.scoreThreshold) {
            p.state = PeriodState.Rejected;
        } else if (a.mode == GovernanceMode.AUTO) {
            _commit(a);
            p.state = PeriodState.Approved;
        } else {
            p.state = PeriodState.PendingApproval;
            p.approvalDeadline = uint64(block.timestamp + approvalWindow);
        }

        emit BatchSubmitted(agreementId, periodId, auditHash, score, scoreVersion, p.state);
    }

    /// @notice Second step of HYBRID mode. The account that submitted the batch can never approve it.
    function approve(uint256 agreementId, uint256 periodId) external onlyFinancialManager whenNotPaused {
        Agreement storage a = _agreement(agreementId);
        Period storage p = periods[agreementId][periodId];
        if (p.state != PeriodState.PendingApproval) revert InvalidState();
        if (msg.sender == p.submitter) revert SameAccount();
        if (block.timestamp > p.approvalDeadline) revert DeadlinePassed();

        _commit(a);
        p.state = PeriodState.Approved;
        emit PeriodApproved(agreementId, periodId, msg.sender);
    }

    function reject(uint256 agreementId, uint256 periodId) external onlyFinancialManager {
        _agreement(agreementId);
        Period storage p = periods[agreementId][periodId];
        if (p.state != PeriodState.PendingApproval) revert InvalidState();
        p.state = PeriodState.Rejected;
        emit PeriodRejected(agreementId, periodId, msg.sender);
    }

    /// @notice Anyone can move an unapproved period to review once its deadline has passed.
    function expire(uint256 agreementId, uint256 periodId) external {
        _agreement(agreementId);
        Period storage p = periods[agreementId][periodId];
        if (p.state != PeriodState.PendingApproval) revert InvalidState();
        if (block.timestamp <= p.approvalDeadline) revert DeadlineNotReached();
        p.state = PeriodState.InReview;
        emit PeriodExpired(agreementId, periodId);
    }

    function closeNoPay(uint256 agreementId, uint256 periodId) external onlyAdmin {
        _agreement(agreementId);
        Period storage p = periods[agreementId][periodId];
        if (p.state != PeriodState.Rejected && p.state != PeriodState.InReview) revert InvalidState();
        p.state = PeriodState.ClosedNoPay;
        emit ClosedNoPay(agreementId, periodId);
    }

    /// @notice Pays the producer from the funds committed to this period. Anyone may call it.
    function release(uint256 agreementId, uint256 periodId) external whenNotPaused nonReentrant {
        Agreement storage a = _agreement(agreementId);
        Period storage p = periods[agreementId][periodId];
        if (p.state != PeriodState.Approved) revert InvalidState();

        uint256 amount = a.periodAmount;
        // Effects before the external call.
        p.state = PeriodState.Released;
        a.committed -= amount;
        a.released += amount;
        totalLiabilities -= amount;

        emit PeriodReleased(agreementId, periodId, a.producer, amount);
        _payout(a.producer, amount);
    }

    // ---------------------------------------------------------------------------------------
    // Withdrawals
    // ---------------------------------------------------------------------------------------

    /// @notice Pulls a payout that could not be pushed (for example the recipient refused the transfer).
    function withdrawPending() external nonReentrant {
        uint256 amount = pendingWithdrawals[msg.sender];
        if (amount == 0) revert NothingPending();
        pendingWithdrawals[msg.sender] = 0;
        totalLiabilities -= amount;
        _send(msg.sender, amount);
        emit PendingWithdrawn(msg.sender, amount);
    }

    /// @notice Returns free (uncommitted) funds to the funder.
    function refund(uint256 agreementId, uint256 amount) external onlyAdmin nonReentrant {
        Agreement storage a = _agreement(agreementId);
        if (a.funder == address(0)) revert NoFunder();
        if (amount > _free(a)) revert ExceedsFree();
        a.refunded += amount;
        totalLiabilities -= amount;
        emit Refunded(agreementId, a.funder, amount);
        _payout(a.funder, amount);
    }

    /// @notice Only the balance that no agreement or pending payout owns can be withdrawn.
    function withdrawExcess(uint256 amount) external onlyAdmin nonReentrant {
        uint256 balance = address(this).balance;
        uint256 excess = balance > totalLiabilities ? balance - totalLiabilities : 0;
        if (amount > excess) revert ExceedsExcess();
        _send(admin, amount);
        emit ExcessWithdrawn(admin, amount);
    }

    // ---------------------------------------------------------------------------------------
    // Administration
    // ---------------------------------------------------------------------------------------

    function pause() external onlyAdmin {
        paused = true;
        emit Paused(msg.sender);
    }

    function unpause() external onlyAdmin {
        paused = false;
        emit Unpaused(msg.sender);
    }

    function proposeAdmin(address newAdmin) external onlyAdmin {
        if (newAdmin == address(0)) revert ZeroAddress();
        pendingAdmin = newAdmin;
        emit AdminProposed(msg.sender, newAdmin);
    }

    function acceptAdmin() external {
        if (msg.sender != pendingAdmin) revert NotPendingAdmin();
        emit AdminChanged(admin, msg.sender);
        admin = msg.sender;
        pendingAdmin = address(0);
    }

    function setFinancialManager(address newManager) external onlyAdmin {
        if (newManager == address(0)) revert ZeroAddress();
        emit FinancialManagerChanged(financialManager, newManager);
        financialManager = newManager;
    }

    function setApprovalWindow(uint256 newWindow) external onlyAdmin {
        if (newWindow == 0) revert InvalidParams();
        emit ApprovalWindowChanged(approvalWindow, newWindow);
        approvalWindow = newWindow;
    }

    // ---------------------------------------------------------------------------------------
    // Views
    // ---------------------------------------------------------------------------------------

    function getAgreement(uint256 agreementId) external view returns (Agreement memory) {
        return _agreement(agreementId);
    }

    function getPeriod(uint256 agreementId, uint256 periodId) external view returns (Period memory) {
        _agreement(agreementId);
        return periods[agreementId][periodId];
    }

    function freeBalance(uint256 agreementId) external view returns (uint256) {
        return _free(_agreement(agreementId));
    }

    // ---------------------------------------------------------------------------------------
    // Internals
    // ---------------------------------------------------------------------------------------

    function _agreement(uint256 agreementId) private view returns (Agreement storage a) {
        if (agreementId >= agreementCount) revert AgreementNotFound();
        a = agreements[agreementId];
    }

    function _free(Agreement storage a) private view returns (uint256) {
        return a.deposited - a.released - a.refunded - a.committed;
    }

    /// @dev Reserves one period amount from the agreement's own free balance.
    function _commit(Agreement storage a) private {
        if (_free(a) < a.periodAmount) revert InsufficientFreeBalance();
        a.committed += a.periodAmount;
    }

    /// @dev Pushes funds; if the recipient refuses, keeps them as a pending withdrawal (still a liability).
    function _payout(address to, uint256 amount) private {
        if (amount == 0) return;
        (bool ok, ) = to.call{value: amount}("");
        if (!ok) {
            pendingWithdrawals[to] += amount;
            totalLiabilities += amount;
            emit PayoutDeferred(to, amount);
        }
    }

    function _send(address to, uint256 amount) private {
        (bool ok, ) = to.call{value: amount}("");
        if (!ok) revert TransferFailed();
    }
}
