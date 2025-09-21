export default CACHE;
export type PrivateKey = import("./PrivateKey.js").default;
export type Ed25519PrivateKey = import("./Ed25519PrivateKey.js").default;
export type EcdsaPrivateKey = import("./EcdsaPrivateKey.js").default;
export type Mnemonic = import("./Mnemonic.js").default;
declare namespace CACHE {
    let privateKeyConstructor: ((key: Ed25519PrivateKey | EcdsaPrivateKey) => PrivateKey) | null;
    let privateKeyFromBytes: ((bytes: Uint8Array) => PrivateKey) | null;
    let mnemonicFromString: ((words: string) => Mnemonic) | null;
}
