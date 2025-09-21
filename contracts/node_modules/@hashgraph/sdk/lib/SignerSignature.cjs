"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
// SPDX-License-Identifier: Apache-2.0

/**
 * @typedef {import("./PublicKey.js").default} PublicKey
 * @typedef {import("./account/AccountId.js").default} AccountId
 */

/**
 * Represents a signature associated with a signer in the Hedera network.
 *
 * The `SignerSignature` class encapsulates the public key, signature, and account ID
 * of a signer. It is used to manage and validate signatures in transactions, ensuring
 * that the correct signers are associated with the transaction data.
 */
class SignerSignature {
  /**
   * @param {object} props
   * @param {PublicKey} props.publicKey
   * @param {Uint8Array} props.signature
   * @param {AccountId} props.accountId
   */
  constructor(props) {
    this.publicKey = props.publicKey;
    this.signature = props.signature;
    this.accountId = props.accountId;
  }
}
exports.default = SignerSignature;