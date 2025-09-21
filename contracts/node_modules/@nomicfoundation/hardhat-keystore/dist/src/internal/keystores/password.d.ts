import type { KeystoreConsoleLog, KeystoreRequestSecretInput } from "../types.js";
export declare function getPasswordHandlers(requestSecretInput: KeystoreRequestSecretInput, consoleLog: KeystoreConsoleLog, isDevKeystore: boolean, devPasswordFilePath: string): {
    setUpPassword: () => Promise<string>;
    askPassword: () => Promise<string>;
    setNewPassword: (password: string) => Promise<string>;
};
export declare function setUpPassword(requestSecretInput: KeystoreRequestSecretInput, consoleLog?: KeystoreConsoleLog): Promise<string>;
export declare function setUpPasswordForDevKeystore(devPasswordFilePath: string): Promise<string>;
export declare function setNewPassword(requestSecretInput: KeystoreRequestSecretInput, consoleLog?: KeystoreConsoleLog): Promise<string>;
export declare function askPassword(requestSecretInput: KeystoreRequestSecretInput): Promise<string>;
export declare function askPasswordForDevKeystore(devPasswordFilePath: string): Promise<string>;
//# sourceMappingURL=password.d.ts.map