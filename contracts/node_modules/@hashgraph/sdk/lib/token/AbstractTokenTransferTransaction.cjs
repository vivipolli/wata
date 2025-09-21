"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _TokenTransfer = _interopRequireDefault(require("./TokenTransfer.cjs"));
var _TokenNftTransfer = _interopRequireDefault(require("../token/TokenNftTransfer.cjs"));
var _TokenId = _interopRequireDefault(require("./TokenId.cjs"));
var _NftId = _interopRequireDefault(require("./NftId.cjs"));
var _AccountId = _interopRequireDefault(require("../account/AccountId.cjs"));
var _Transaction = _interopRequireDefault(require("../transaction/Transaction.cjs"));
var _long = _interopRequireDefault(require("long"));
var _NullableTokenDecimalMap = _interopRequireDefault(require("../account/NullableTokenDecimalMap.cjs"));
var _TokenNftTransferMap = _interopRequireDefault(require("../account/TokenNftTransferMap.cjs"));
var _TokenTransferMap = _interopRequireDefault(require("../account/TokenTransferMap.cjs"));
var _TokenTransferAccountMap = _interopRequireDefault(require("../account/TokenTransferAccountMap.cjs"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
// SPDX-License-Identifier: Apache-2.0

/**
 * @namespace proto
 * @typedef {import("@hashgraph/proto").proto.ITokenAirdropTransactionBody} HieroProto.proto.ITokenAirdropTransactionBody
 */

/**
 * @typedef {object} TransferTokensInput
 * @property {TokenId | string} tokenId
 * @property {AccountId | string} accountId
 * @property {Long | number} amount
 */

/**
 * @typedef {object} TransferNftInput
 * @property {TokenId | string} tokenId
 * @property {AccountId | string} sender
 * @property {AccountId | string} recipient
 * @property {Long | number} serial
 */

class AbstractTokenTransferTransaction extends _Transaction.default {
  /**
   * @param {object} [props]
   * @param {(TransferTokensInput)[]} [props.tokenTransfers]
   * @param {(TransferNftInput)[]} [props.nftTransfers]
   */
  constructor(props = {}) {
    super();

    /**
     * @protected
     * @type {TokenTransfer[]}
     */
    this._tokenTransfers = [];

    /**
     * @protected
     * @type {TokenNftTransfer[]}
     */
    this._nftTransfers = [];
    for (const transfer of props.tokenTransfers != null ? props.tokenTransfers : []) {
      this.addTokenTransfer(transfer.tokenId, transfer.accountId, transfer.amount);
    }
    for (const transfer of props.nftTransfers != null ? props.nftTransfers : []) {
      this.addNftTransfer(transfer.tokenId, transfer.serial, transfer.sender, transfer.recipient);
    }
  }

  /**
   * @param {NftId | TokenId | string} tokenIdOrNftId
   * @param {AccountId | string | Long | number} senderAccountIdOrSerialNumber
   * @param {AccountId | string} receiverAccountIdOrSenderAccountId
   * @param {(AccountId | string)=} receiver
   * @returns {this}
   */
  addNftTransfer(tokenIdOrNftId, senderAccountIdOrSerialNumber, receiverAccountIdOrSenderAccountId, receiver) {
    return this._addNftTransfer(false, tokenIdOrNftId, senderAccountIdOrSerialNumber, receiverAccountIdOrSenderAccountId, receiver);
  }

  /**
   * @param {TokenId | string} tokenId
   * @param {AccountId | string} accountId
   * @param {number | Long} amount
   * @param {boolean} isApproved
   * @param {number | null} expectedDecimals
   * @returns {this}
   */
  _addTokenTransfer(tokenId, accountId, amount, isApproved, expectedDecimals) {
    this._requireNotFrozen();
    const token = tokenId instanceof _TokenId.default ? tokenId : _TokenId.default.fromString(tokenId);
    const account = accountId instanceof _AccountId.default ? accountId : _AccountId.default.fromString(accountId);
    const value = amount instanceof _long.default ? amount : _long.default.fromNumber(amount);
    for (const tokenTransfer of this._tokenTransfers) {
      if (tokenTransfer.tokenId.compare(token) === 0 && tokenTransfer.accountId.compare(account) === 0) {
        tokenTransfer.amount = tokenTransfer.amount.add(value);
        tokenTransfer.expectedDecimals = expectedDecimals;
        return this;
      }
    }
    this._tokenTransfers.push(new _TokenTransfer.default({
      tokenId,
      accountId,
      expectedDecimals: expectedDecimals,
      amount,
      isApproved
    }));
    return this;
  }

  /**
   * @param {TokenId | string} tokenId
   * @param {AccountId | string} accountId
   * @param {number | Long} amount
   * @returns {this}
   */
  addTokenTransfer(tokenId, accountId, amount) {
    return this._addTokenTransfer(tokenId, accountId, amount, false, null);
  }

  /**
   * @param {boolean} isApproved
   * @param {NftId | TokenId | string} tokenIdOrNftId
   * @param {AccountId | string | Long | number} senderAccountIdOrSerialNumber
   * @param {AccountId | string} receiverAccountIdOrSenderAccountId
   * @param {(AccountId | string)=} receiver
   * @returns {this}
   */
  _addNftTransfer(isApproved, tokenIdOrNftId, senderAccountIdOrSerialNumber, receiverAccountIdOrSenderAccountId, receiver) {
    this._requireNotFrozen();
    let nftId;
    let senderAccountId;
    let receiverAccountId;
    if (tokenIdOrNftId instanceof _NftId.default) {
      nftId = tokenIdOrNftId;
      senderAccountId = typeof senderAccountIdOrSerialNumber === "string" ? _AccountId.default.fromString(senderAccountIdOrSerialNumber) : (/** @type {AccountId} */senderAccountIdOrSerialNumber);
      receiverAccountId = typeof receiverAccountIdOrSenderAccountId === "string" ? _AccountId.default.fromString(receiverAccountIdOrSenderAccountId) : (/** @type {AccountId} */
      receiverAccountIdOrSenderAccountId);
    } else if (tokenIdOrNftId instanceof _TokenId.default) {
      nftId = new _NftId.default(tokenIdOrNftId, /** @type {Long} */senderAccountIdOrSerialNumber);
      senderAccountId = typeof receiverAccountIdOrSenderAccountId === "string" ? _AccountId.default.fromString(receiverAccountIdOrSenderAccountId) : (/** @type {AccountId} */
      receiverAccountIdOrSenderAccountId);
      receiverAccountId = typeof receiver === "string" ? _AccountId.default.fromString(receiver) : (/** @type {AccountId} */receiver);
    } else {
      try {
        nftId = _NftId.default.fromString(tokenIdOrNftId);
        senderAccountId = typeof senderAccountIdOrSerialNumber === "string" ? _AccountId.default.fromString(senderAccountIdOrSerialNumber) : (/** @type {AccountId} */
        senderAccountIdOrSerialNumber);
        receiverAccountId = typeof receiverAccountIdOrSenderAccountId === "string" ? _AccountId.default.fromString(receiverAccountIdOrSenderAccountId) : (/** @type {AccountId} */
        receiverAccountIdOrSenderAccountId);
      } catch (_) {
        const tokenId = _TokenId.default.fromString(tokenIdOrNftId);
        nftId = new _NftId.default(tokenId, /** @type {Long} */senderAccountIdOrSerialNumber);
        senderAccountId = typeof receiverAccountIdOrSenderAccountId === "string" ? _AccountId.default.fromString(receiverAccountIdOrSenderAccountId) : (/** @type {AccountId} */
        receiverAccountIdOrSenderAccountId);
        receiverAccountId = typeof receiver === "string" ? _AccountId.default.fromString(receiver) : (/** @type {AccountId} */receiver);
      }
    }
    for (const nftTransfer of this._nftTransfers) {
      if (nftTransfer.tokenId.compare(nftId.tokenId) === 0 && nftTransfer.serialNumber.compare(nftId.serial) === 0) {
        nftTransfer.senderAccountId = senderAccountId;
        nftTransfer.receiverAccountId = receiverAccountId;
        return this;
      }
    }
    this._nftTransfers.push(new _TokenNftTransfer.default({
      tokenId: nftId.tokenId,
      serialNumber: nftId.serial,
      senderAccountId,
      receiverAccountId,
      isApproved
    }));
    return this;
  }

  /**
   * @param {NftId | TokenId | string} tokenIdOrNftId
   * @param {AccountId | string | Long | number} senderAccountIdOrSerialNumber
   * @param {AccountId | string} receiverAccountIdOrSenderAccountId
   * @param {(AccountId | string)=} receiver
   * @returns {this}
   */
  addApprovedNftTransfer(tokenIdOrNftId, senderAccountIdOrSerialNumber, receiverAccountIdOrSenderAccountId, receiver) {
    return this._addNftTransfer(true, tokenIdOrNftId, senderAccountIdOrSerialNumber, receiverAccountIdOrSenderAccountId, receiver);
  }

  /**
   * @param {TokenId | string} tokenId
   * @param {AccountId | string} accountId
   * @param {number | Long} amount
   * @returns {this}
   */
  addApprovedTokenTransfer(tokenId, accountId, amount) {
    return this._addTokenTransfer(tokenId, accountId, amount, true, null);
  }

  /**
   * @param {TokenId | string} tokenId
   * @param {AccountId | string} accountId
   * @param {number | Long} amount
   * @param {number} decimals
   * @returns {this}
   */
  addTokenTransferWithDecimals(tokenId, accountId, amount, decimals) {
    this._requireNotFrozen();
    const token = tokenId instanceof _TokenId.default ? tokenId : _TokenId.default.fromString(tokenId);
    const account = accountId instanceof _AccountId.default ? accountId : _AccountId.default.fromString(accountId);
    const value = amount instanceof _long.default ? amount : _long.default.fromNumber(amount);
    let found = false;
    for (const tokenTransfer of this._tokenTransfers) {
      if (tokenTransfer.tokenId.compare(token) === 0) {
        if (tokenTransfer.expectedDecimals != null && tokenTransfer.expectedDecimals !== decimals) {
          throw new Error("expected decimals mis-match");
        } else {
          tokenTransfer.expectedDecimals = decimals;
        }
        if (tokenTransfer.accountId.compare(account) === 0) {
          tokenTransfer.amount = tokenTransfer.amount.add(value);
          tokenTransfer.expectedDecimals = decimals;
          found = true;
        }
      }
    }
    if (found) {
      return this;
    }
    this._tokenTransfers.push(new _TokenTransfer.default({
      tokenId,
      accountId,
      expectedDecimals: decimals,
      amount,
      isApproved: false
    }));
    return this;
  }

  /**
   * @returns {NullableTokenDecimalMap}
   */
  get tokenIdDecimals() {
    const map = new _NullableTokenDecimalMap.default();
    for (const transfer of this._tokenTransfers) {
      map._set(transfer.tokenId, transfer.expectedDecimals);
    }
    return map;
  }

  /**
   * @returns {TokenNftTransferMap}
   */
  get nftTransfers() {
    const map = new _TokenNftTransferMap.default();
    for (const transfer of this._nftTransfers) {
      const transferList = map.get(transfer.tokenId);
      const nftTransfer = {
        sender: transfer.senderAccountId,
        recipient: transfer.receiverAccountId,
        serial: transfer.serialNumber,
        isApproved: transfer.isApproved
      };
      if (transferList != null) {
        transferList.push(nftTransfer);
      } else {
        map._set(transfer.tokenId, [nftTransfer]);
      }
    }
    return map;
  }

  /**
   * @returns {TokenTransferMap}
   */
  get tokenTransfers() {
    const map = new _TokenTransferMap.default();
    for (const transfer of this._tokenTransfers) {
      let transferMap = map.get(transfer.tokenId);
      if (transferMap != null) {
        transferMap._set(transfer.accountId, transfer.amount);
      } else {
        transferMap = new _TokenTransferAccountMap.default();
        transferMap._set(transfer.accountId, transfer.amount);
        map._set(transfer.tokenId, transferMap);
      }
    }
    return map;
  }

  /**
   * @override
   * @protected
   * @returns {HieroProto.proto.ITokenAirdropTransactionBody}
   */
  _makeTransactionData() {
    /** @type {{tokenId: TokenId; expectedDecimals: number | null; transfers: TokenTransfer[]; nftTransfers: TokenNftTransfer[];}[]} */
    const tokenTransferList = [];
    this._tokenTransfers.sort((a, b) => {
      const compare = a.tokenId.compare(b.tokenId);
      if (compare !== 0) {
        return compare;
      }
      return a.accountId.compare(b.accountId);
    });
    this._nftTransfers.sort((a, b) => {
      const senderComparision = a.senderAccountId.compare(b.senderAccountId);
      if (senderComparision != 0) {
        return senderComparision;
      }
      const recipientComparision = a.receiverAccountId.compare(b.receiverAccountId);
      if (recipientComparision != 0) {
        return recipientComparision;
      }
      return a.serialNumber.compare(b.serialNumber);
    });
    let i = 0;
    let j = 0;
    while (i < this._tokenTransfers.length || j < this._nftTransfers.length) {
      if (i < this._tokenTransfers.length && j < this._nftTransfers.length) {
        const iTokenId = this._tokenTransfers[i].tokenId;
        const jTokenId = this._nftTransfers[j].tokenId;
        const last = tokenTransferList.length > 0 ? tokenTransferList[tokenTransferList.length - 1] : null;
        const lastTokenId = last != null ? last.tokenId : null;
        if (last != null && lastTokenId != null && lastTokenId.compare(iTokenId) === 0) {
          last.transfers.push(this._tokenTransfers[i++]);
          continue;
        }
        if (last != null && lastTokenId != null && lastTokenId.compare(jTokenId) === 0) {
          last.nftTransfers.push(this._nftTransfers[j++]);
          continue;
        }
        const result = iTokenId.compare(jTokenId);
        if (result === 0) {
          tokenTransferList.push({
            tokenId: iTokenId,
            expectedDecimals: this._tokenTransfers[i].expectedDecimals,
            transfers: [this._tokenTransfers[i++]],
            nftTransfers: [this._nftTransfers[j++]]
          });
        } else if (result < 0) {
          tokenTransferList.push({
            tokenId: iTokenId,
            expectedDecimals: this._tokenTransfers[i].expectedDecimals,
            transfers: [this._tokenTransfers[i++]],
            nftTransfers: []
          });
        } else {
          tokenTransferList.push({
            tokenId: jTokenId,
            expectedDecimals: null,
            transfers: [],
            nftTransfers: [this._nftTransfers[j++]]
          });
        }
      } else if (i < this._tokenTransfers.length) {
        const iTokenId = this._tokenTransfers[i].tokenId;
        let last;
        for (const transfer of tokenTransferList) {
          if (transfer.tokenId.compare(iTokenId) === 0) {
            last = transfer;
          }
        }
        const lastTokenId = last != null ? last.tokenId : null;
        if (last != null && lastTokenId != null && lastTokenId.compare(iTokenId) === 0) {
          last.transfers.push(this._tokenTransfers[i++]);
          continue;
        }
        tokenTransferList.push({
          tokenId: iTokenId,
          expectedDecimals: this._tokenTransfers[i].expectedDecimals,
          transfers: [this._tokenTransfers[i++]],
          nftTransfers: []
        });
      } else if (j < this._nftTransfers.length) {
        const jTokenId = this._nftTransfers[j].tokenId;
        let last;
        for (const transfer of tokenTransferList) {
          if (transfer.tokenId.compare(jTokenId) === 0) {
            last = transfer;
          }
        }
        const lastTokenId = last != null ? last.tokenId : null;
        if (last != null && lastTokenId != null && lastTokenId.compare(jTokenId) === 0) {
          last.nftTransfers.push(this._nftTransfers[j++]);
          continue;
        }
        tokenTransferList.push({
          tokenId: jTokenId,
          expectedDecimals: null,
          transfers: [],
          nftTransfers: [this._nftTransfers[j++]]
        });
      }
    }
    return {
      tokenTransfers: tokenTransferList.map(tokenTransfer => {
        return {
          token: tokenTransfer.tokenId._toProtobuf(),
          expectedDecimals: tokenTransfer.expectedDecimals != null ? {
            value: tokenTransfer.expectedDecimals
          } : null,
          transfers: tokenTransfer.transfers.map(transfer => transfer._toProtobuf()),
          nftTransfers: tokenTransfer.nftTransfers.map(transfer => transfer._toProtobuf())
        };
      })
    };
  }
}
exports.default = AbstractTokenTransferTransaction;