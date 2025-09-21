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
const starknet_1 = require("starknet");
const StarknetSigner_1 = require("./StarknetSigner");
const constants_1 = require("../../constants");
const utils_1 = require("../../utils");
class InjectedStarknetSigner {
    constructor(provider, walletAccount, accountContractId) {
        this.ownerLength = constants_1.SIG_CONFIG[constants_1.SignatureConfig.STARKNET].pubLength;
        this.signatureLength = constants_1.SIG_CONFIG[constants_1.SignatureConfig.STARKNET].sigLength;
        this.signatureType = constants_1.SignatureConfig.STARKNET;
        this.provider = provider;
        this.walletAccount = walletAccount;
        this.accountContractId = accountContractId;
    }
    init(pubKey) {
        return __awaiter(this, void 0, void 0, function* () {
            const address = this.walletAccount.address;
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
            if (!this.walletAccount.signMessage)
                throw new Error("Selected signer does not support message signing");
            // generate message hash and signature
            const chainId = this.chainId;
            const msg = starknet_1.hash.computeHashOnElements((0, StarknetSigner_1.uint8ArrayToBigNumberishArray)(message));
            const data = (0, StarknetSigner_1.getTypedData)(msg, chainId);
            const signature = yield this.walletAccount.signMessage(data);
            // due to account abstraction different wallets, return different signature types.
            // the last two components in the array are mostly the r and s components
            const rsComponents = Array.from(signature).slice(-2);
            const r = BigInt(rsComponents[0]).toString(16).padStart(64, "0");
            const s = BigInt(rsComponents[1]).toString(16).padStart(64, "0");
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
            const originalPubKey = pubkey.slice(0, 33);
            const originalAddress = "0x" + Buffer.from(pubkey.slice(33, -2)).toString("hex");
            // retrieve chainId from signature
            const chainIdArrayRetrieved = signature.slice(rLength + sLength);
            const originalChainId = "0x" + Buffer.from(chainIdArrayRetrieved).toString("hex");
            // calculate full public key
            const fullPubKey = starknet_1.encode.addHexPrefix(starknet_1.encode.buf2hex(originalPubKey));
            // generate message hash and signature
            const msg = starknet_1.hash.computeHashOnElements((0, StarknetSigner_1.uint8ArrayToBigNumberishArray)(message));
            const data = (0, StarknetSigner_1.getTypedData)(msg, originalChainId);
            const msgHash = starknet_1.typedData.getMessageHash(data, originalAddress);
            const trimmedSignature = signature.slice(0, -32);
            // verify
            return starknet_1.ec.starkCurve.verify(trimmedSignature, msgHash, fullPubKey);
        });
    }
}
exports.default = InjectedStarknetSigner;
//# sourceMappingURL=injectedStarknetSigner.js.map