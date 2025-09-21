export declare class UserDisplayMessages {
    static displayInvalidKeyErrorMessage(key: string): string;
    static displayKeyAlreadyExistsWarning(key: string, dev: boolean): string;
    static displayKeyListInfoMessage(keys: string[], dev: boolean): string;
    static displayKeyNotFoundErrorMessage(key: string, dev: boolean): string;
    static displayKeyRemovedInfoMessage(key: string, dev: boolean): string;
    static displayKeySetInfoMessage(key: string, dev: boolean): string;
    static displayNoKeysInfoMessage(dev: boolean): string;
    static displayNoKeystoreSetErrorMessage(dev: boolean): string;
    static displaySecretCannotBeEmptyErrorMessage(): string;
    static displayValueInfoMessage(value: string): string;
    static enterSecretMessage(dev: boolean): string;
    static keystoreBannerMessage(): string;
    static passwordSetUpMessage(): string;
    static unlockBeforePasswordChangeMessage(): string;
    static passwordChangeMessage(): string;
    static passwordChangedSuccessMessage(): string;
    static passwordRequirementsMessage(): string;
    static enterPasswordMsg(): string;
    static passwordRequirementsError(): string;
    static confirmPasswordMessage(): string;
    static passwordsDoNotMatchError(): string;
}
//# sourceMappingURL=user-display-messages.d.ts.map