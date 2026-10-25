// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

interface IEscrowLike {
    function withdrawPending() external;
}

/// @dev Test-only producer. It can refuse funds, try to re-enter the escrow while being paid,
/// and pull its deferred payout later. It must never be deployed outside tests.
contract MockProducer {
    bool public acceptFunds;
    bool public reenterRelease;
    bool public reenterWithdraw;
    bool public reentryAttempted;
    bool public reentrySucceeded;
    address public target;
    uint256 public agreementId;
    uint256 public periodId;

    function configure(
        bool _acceptFunds,
        bool _reenterRelease,
        bool _reenterWithdraw,
        address _target,
        uint256 _agreementId,
        uint256 _periodId
    ) external {
        acceptFunds = _acceptFunds;
        reenterRelease = _reenterRelease;
        reenterWithdraw = _reenterWithdraw;
        target = _target;
        agreementId = _agreementId;
        periodId = _periodId;
    }

    function pullPending(address escrow) external {
        IEscrowLike(escrow).withdrawPending();
    }

    receive() external payable {
        require(acceptFunds, "MockProducer: funds refused");
        if (reenterRelease) {
            reentryAttempted = true;
            (bool ok, ) = target.call(abi.encodeWithSignature("release(uint256,uint256)", agreementId, periodId));
            if (ok) reentrySucceeded = true;
        }
        if (reenterWithdraw) {
            reentryAttempted = true;
            (bool ok, ) = target.call(abi.encodeWithSignature("withdrawPending()"));
            if (ok) reentrySucceeded = true;
        }
    }
}
