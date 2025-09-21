import { Account, ec, encode, hash, typedData } from "starknet";
import { SignatureConfig, SIG_CONFIG } from "../../constants.js";
import { shortTo2ByteArray } from "../../utils.js";
export function extractX(bytes) {
    const hex = bytes.subarray(1).toString("hex");
    const stripped = hex.replace(/^0+/gm, ""); // strip leading 0s
    return `0x${stripped}`;
}
export default class StarknetSigner {
    signer;
    // public key is structured as: actual public key (33 bytes), address (32 bytes), accountContractId (2 bytes)
    // this is because normal public key -> address derivation is impossible, so we use an identifer to know which account ABI the signer is using, so we can access the public key from the account contract to verify the public key -> address association
    publicKey;
    address;
    privateKey;
    provider;
    chainId;
    accountContractId;
    ownerLength = SIG_CONFIG[SignatureConfig.STARKNET].pubLength;
    signatureLength = SIG_CONFIG[SignatureConfig.STARKNET].sigLength;
    signatureType = SignatureConfig.STARKNET;
    constructor(provider, address, privateKey, accountContractId) {
        this.provider = provider;
        this.address = address;
        this.privateKey = privateKey;
        this.accountContractId = accountContractId;
        this.signer = new Account(provider, address, privateKey);
    }
    async init() {
        const pubKey = encode.addHexPrefix(encode.buf2hex(ec.starkCurve.getPublicKey(this.privateKey, true)));
        const address = this.signer.address;
        // get pubkey and address buffers
        const pubKeyBuffer = Buffer.from(pubKey.startsWith("0x") ? pubKey.slice(2) : pubKey, "hex");
        const addressBuffer = Buffer.from(address.startsWith("0x") ? address.slice(2) : address, "hex");
        const accountContractId = shortTo2ByteArray(this.accountContractId);
        // concatenate buffers as pubKey
        this.publicKey = Buffer.concat([pubKeyBuffer, addressBuffer, accountContractId]);
        this.chainId = await this.provider.getChainId();
    }
    async sign(message, _opts) {
        if (!this.publicKey) {
            await this.init();
        }
        if (!this.signer.signMessage)
            throw new Error("Selected signer does not support message signing!");
        // generate message hash and signature
        const chainId = this.chainId;
        const msg = hash.computeHashOnElements(uint8ArrayToBigNumberishArray(message));
        const data = getTypedData(msg, chainId);
        const signature = (await this.signer.signMessage(data));
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
    }
    static async verify(pubkey, message, signature, _opts) {
        const rLength = 32;
        const sLength = 32;
        // retrieve pubKey and address from pubKey
        const [originalPubKey, originalAddressBin] = decomposePubkey(pubkey);
        const originalAddress = "0x" + Buffer.from(originalAddressBin).toString("hex");
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
export function decomposePubkey(pubkey) {
    return [pubkey.slice(0, 33), pubkey.slice(33, -2), pubkey.slice(-2)];
}
// convert message to TypedData format
export function getTypedData(message, chainId) {
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
// convert Uint8Array to BigNumberish
export function uint8ArrayToBigNumberishArray(uint8Arr) {
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
//# sourceMappingURL=StarknetSigner.js.map