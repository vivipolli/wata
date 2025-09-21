import { ec, encode, hash, typedData } from "starknet";
import { getTypedData, uint8ArrayToBigNumberishArray } from "./StarknetSigner.js";
import { SignatureConfig, SIG_CONFIG } from "../../constants.js";
import { shortTo2ByteArray } from "../../utils.js";
export default class InjectedStarknetSigner {
    walletAccount;
    publicKey;
    provider;
    chainId;
    accountContractId;
    ownerLength = SIG_CONFIG[SignatureConfig.STARKNET].pubLength;
    signatureLength = SIG_CONFIG[SignatureConfig.STARKNET].sigLength;
    signatureType = SignatureConfig.STARKNET;
    constructor(provider, walletAccount, accountContractId) {
        this.provider = provider;
        this.walletAccount = walletAccount;
        this.accountContractId = accountContractId;
    }
    async init(pubKey) {
        const address = this.walletAccount.address;
        // get pubkey and address buffers
        const pubKeyBuffer = Buffer.from(pubKey.startsWith("0x") ? pubKey.slice(2) : pubKey, "hex");
        const addressBuffer = Buffer.from(address.startsWith("0x") ? address.slice(2) : address, "hex");
        const accountContractId = shortTo2ByteArray(this.accountContractId);
        // concatenate buffers as pubKey
        this.publicKey = Buffer.concat([pubKeyBuffer, addressBuffer, accountContractId]);
        this.chainId = await this.provider.getChainId();
    }
    async sign(message, _opts) {
        if (!this.walletAccount.signMessage)
            throw new Error("Selected signer does not support message signing");
        // generate message hash and signature
        const chainId = this.chainId;
        const msg = hash.computeHashOnElements(uint8ArrayToBigNumberishArray(message));
        const data = getTypedData(msg, chainId);
        const signature = await this.walletAccount.signMessage(data);
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
    }
    static async verify(pubkey, message, signature, _opts) {
        const rLength = 32;
        const sLength = 32;
        // retrieve pubKey and address from pubKey
        const originalPubKey = pubkey.slice(0, 33);
        const originalAddress = "0x" + Buffer.from(pubkey.slice(33, -2)).toString("hex");
        // retrieve chainId from signature
        const chainIdArrayRetrieved = signature.slice(rLength + sLength);
        const originalChainId = "0x" + Buffer.from(chainIdArrayRetrieved).toString("hex");
        // calculate full public key
        const fullPubKey = encode.addHexPrefix(encode.buf2hex(originalPubKey));
        // generate message hash and signature
        const msg = hash.computeHashOnElements(uint8ArrayToBigNumberishArray(message));
        const data = getTypedData(msg, originalChainId);
        const msgHash = typedData.getMessageHash(data, originalAddress);
        const trimmedSignature = signature.slice(0, -32);
        // verify
        return ec.starkCurve.verify(trimmedSignature, msgHash, fullPubKey);
    }
}
//# sourceMappingURL=injectedStarknetSigner.js.map