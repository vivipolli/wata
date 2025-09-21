"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uint8ArrayToBigNumberishArray = exports.getTypedData = exports.decomposePubkey = exports.extractX = void 0;
const starknet_1 = require("starknet");
const constants_1 = require("../../constants");
const utils_1 = require("../../utils");
function extractX(bytes) {
    const hex = bytes.subarray(1).toString("hex");
    const stripped = hex.replace(/^0+/gm, ""); // strip leading 0s
    return `0x${stripped}`;
}
exports.extractX = extractX;
class StarknetSigner {
    constructor(provider, address, privateKey, accountContractId) {
        this.ownerLength = constants_1.SIG_CONFIG[constants_1.SignatureConfig.STARKNET].pubLength;
        this.signatureLength = constants_1.SIG_CONFIG[constants_1.SignatureConfig.STARKNET].sigLength;
        this.signatureType = constants_1.SignatureConfig.STARKNET;
        this.provider = provider;
        this.address = address;
        this.privateKey = privateKey;
        this.accountContractId = accountContractId;
        this.signer = new starknet_1.Account(provider, address, privateKey);
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            const pubKey = starknet_1.encode.addHexPrefix(starknet_1.encode.buf2hex(starknet_1.ec.starkCurve.getPublicKey(this.privateKey, true)));
            const address = this.signer.address;
            // get pubkey and address buffers
            const pubKeyBuffer = Buffer.from(pubKey.startsWith("0x") ? pubKey.slice(2) : pubKey, "hex");
            const addressBuffer = Buffer.from(address.startsWith("0x") ? address.slice(2) : address, "hex");
            const accountContractId = (0, utils_1.shortTo2ByteArray)(this.accountContractId);
            // concatenate buffers as pubKey
            this.publicKey = Buffer.concat([pubKeyBuffer, addressBuffer, accountContractId]);
            this.chainId = yield this.provider.getChainId();
        });
    }
    sign(message, _opts) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.publicKey) {
                yield this.init();
            }
            if (!this.signer.signMessage)
                throw new Error("Selected signer does not support message signing!");
            // generate message hash and signature
            const chainId = this.chainId;
            const msg = starknet_1.hash.computeHashOnElements(uint8ArrayToBigNumberishArray(message));
            const data = getTypedData(msg, chainId);
            const signature = (yield this.signer.signMessage(data));
            const r = BigInt(signature.r).toString(16).padStart(64, "0"); // Convert BigInt to hex string
            const s = BigInt(signature.s).toString(16).padStart(64, "0"); // Convert BigInt to hex string
            const rArray = Uint8Array.from(Buffer.from(r, "hex"));
            const sArray = Uint8Array.from(Buffer.from(s, "hex"));
            const chainIdToArray = Uint8Array.from(Buffer.from(chainId.replace(/^0x/, "").padStart(64, "0"), "hex"));
            // Concatenate the arrays
            const result = new Uint8Array(rArray.length + sArray.length + chainIdToArray.length);
            result.set(rArray);
            result.set(sArray, rArray.length);
            result.set(chainIdToArray, rArray.length + sArray.length);
            // check signature is of required length
            if (result.length !== 96)
                throw new Error("Signature length must be 96 bytes!");
            return result;
        });
    }
    static verify(pubkey, message, signature, _opts) {
        return __awaiter(this, void 0, void 0, function* () {
            const rLength = 32;
            const sLength = 32;
            // retrieve pubKey and address from pubKey
            const [originalPubKey, originalAddressBin] = decomposePubkey(pubkey);
            const originalAddress = "0x" + Buffer.from(originalAddressBin).toString("hex");
            // retrieve chainId from signature
            const chainIdArrayRetrieved = signature.slice(rLength + sLength);
            const originalChainId = "0x" + Buffer.from(chainIdArrayRetrieved).toString("hex");
            // calculate full public key
            const fullPubKey = starknet_1.encode.addHexPrefix(starknet_1.encode.buf2hex(originalPubKey));
            // generate message hash and signature
            const msg = starknet_1.hash.computeHashOnElements(uint8ArrayToBigNumberishArray(message));
            const data = getTypedData(msg, originalChainId);
            const msgHash = starknet_1.typedData.getMessageHash(data, originalAddress);
            const trimmedSignature = signature.slice(0, -32);
            // verify
            return starknet_1.ec.starkCurve.verify(trimmedSignature, msgHash, fullPubKey);
        });
    }
}
exports.default = StarknetSigner;
function decomposePubkey(pubkey) {
    return [pubkey.slice(0, 33), pubkey.slice(33, -2), pubkey.slice(-2)];
}
exports.decomposePubkey = decomposePubkey;
// convert message to TypedData format
function getTypedData(message, chainId) {
    const typedData = {
        types: {
            StarkNetDomain: [
                { name: "name", type: "shortstring" },
                { name: "version", type: "shortstring" },
                { name: "chainId", type: "shortstring" },
            ],
            SignedMessage: [{ name: "transactionHash", type: "shortstring" }],
        },
        primaryType: "SignedMessage",
        domain: {
            name: "Irys",
            version: "1",
            chainId: chainId,
        },
        message: {
            transactionHash: message,
        },
    };
    return typedData;
}
exports.getTypedData = getTypedData;
// convert Uint8Array to BigNumberish
function uint8ArrayToBigNumberishArray(uint8Arr) {
    const chunkSize = 31; // 252 bits = 31.5 bytes, but using 31 bytes for safety
    const bigNumberishArray = [];
    for (let i = 0; i < uint8Arr.length; i += chunkSize) {
        // Extract a chunk of size 31 bytes
        const chunk = uint8Arr.slice(i, i + chunkSize);
        // Convert the chunk to a bigint
        let bigIntValue = BigInt(0);
        for (let j = 0; j < chunk.length; j++) {
            bigIntValue = (bigIntValue << BigInt(8)) + BigInt(chunk[j]);
        }
        bigNumberishArray.push(bigIntValue);
    }
    return bigNumberishArray;
}
exports.uint8ArrayToBigNumberishArray = uint8ArrayToBigNumberishArray;
//# sourceMappingURL=StarknetSigner.js.map