"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.read = read;
exports.readPemECDSA = readPemECDSA;
exports.readPemED25519 = readPemED25519;
var _BadKeyError = _interopRequireDefault(require("../BadKeyError.cjs"));
var _pkcs = require("../primitive/pkcs.cjs");
var der = _interopRequireWildcard(require("./der.cjs"));
var base64 = _interopRequireWildcard(require("./base64.cjs"));
var _Ed25519PrivateKey = _interopRequireDefault(require("../Ed25519PrivateKey.cjs"));
var _EcdsaPrivateKey = _interopRequireDefault(require("../EcdsaPrivateKey.cjs"));
var asn1 = _interopRequireWildcard(require("asn1js"));
var _pem = _interopRequireDefault(require("forge-light/lib/pem.js"));
var hex = _interopRequireWildcard(require("./hex.cjs"));
var aes = _interopRequireWildcard(require("../primitive/aes.cjs"));
var _buffer = require("buffer");
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
// @ts-ignore

const ID_ED25519 = "1.3.101.112";

/**
 * @param {string} pem
 * @param {string} [passphrase]
 * @returns {Promise<Ed25519PrivateKey | EcdsaPrivateKey | Uint8Array>}
 */
async function readPemED25519(pem, passphrase) {
  const pemKeyData = pem.replace(/-----BEGIN (.*)-----|-----END (.*)-----|\n|\r/g, "");
  const key = base64.decode(pemKeyData);
  if (passphrase) {
    let encrypted;
    try {
      encrypted = _pkcs.EncryptedPrivateKeyInfo.parse(key);
    } catch (error) {
      const message =
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      error != null && /** @type {Error} */error.message != null ?
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      /** @type {Error} */
      error.message : "";
      throw new _BadKeyError.default(`failed to parse encrypted private key: ${message}`);
    }
    const decrypted = await encrypted.decrypt(passphrase);
    let privateKey = null;
    if (decrypted.algId.algIdent === ID_ED25519) {
      privateKey = _Ed25519PrivateKey.default;
    } else {
      throw new _BadKeyError.default(`unknown private key algorithm ${decrypted.algId.toString()}`);
    }
    const keyData = der.decode(decrypted.privateKey);
    if (!("bytes" in keyData)) {
      throw new _BadKeyError.default(`expected ASN bytes, got ${JSON.stringify(keyData)}`);
    }
    return privateKey.fromBytes(keyData.bytes);
  }
  return key.subarray(16);
}

/**
 * @param {string} pem
 * @param {string} [passphrase]
 * @returns {Promise<Ed25519PrivateKey | EcdsaPrivateKey | Uint8Array>}
 */
async function readPemECDSA(pem, passphrase) {
  const pemKeyData = pem.replace(/-----BEGIN (.*)-----|-----END (.*)-----|\n|\r/g, "");
  const key = base64.decode(pemKeyData);
  if (passphrase) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    const decodedPem = _pem.default.decode(pem)[0];
    /** @type {string} */
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment
    const ivString = decodedPem.dekInfo.parameters;
    const iv = hex.decode(ivString);
    const pemLines = pem.split("\n");
    const key = await aes.messageDigest(passphrase, ivString);
    const dataToDecrypt = _buffer.Buffer.from(pemLines.slice(4, pemLines.length - 1).join(""), "base64");
    const keyDerBytes = await aes.createDecipheriv(aes.CipherAlgorithm.Aes128Cbc, key, iv, dataToDecrypt);
    return _EcdsaPrivateKey.default.fromBytesDer(keyDerBytes);
  } else {
    const asnData = asn1.fromBER(key);
    const parsedKey = asnData.result;

    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return
    return parsedKey.valueBlock.value[1].valueBlock.valueHexView;
  }
}

/**
 * @param {string} pem
 * @param {string} [passphrase]
 * @returns {Promise<Ed25519PrivateKey | EcdsaPrivateKey | Uint8Array>}
 */
async function read(pem, passphrase) {
  // If not then it is ED25519 type
  const isEcdsa = pem.includes("BEGIN EC PRIVATE KEY") ? true : false;
  if (isEcdsa) {
    return readPemECDSA(pem, passphrase);
  } else {
    return readPemED25519(pem, passphrase);
  }
}