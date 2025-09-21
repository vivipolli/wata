import chalk from "chalk";
import { getKeystoreType } from "../utils/get-keystore-type.js";
export class UserDisplayMessages {
    static displayInvalidKeyErrorMessage(key) {
        return chalk.red(`Invalid value for key: "${key}". Keys can only have alphanumeric characters and underscores, and they cannot start with a number.`);
    }
    static displayKeyAlreadyExistsWarning(key, dev) {
        return chalk.yellow(`The key "${key}" already exists in the ${getKeystoreType(dev)} keystore. Use the ${chalk.blue.italic("--force")} flag to overwrite it.`);
    }
    static displayKeyListInfoMessage(keys, dev) {
        let output = `Keys in the ${getKeystoreType(dev)} keystore:`;
        for (const key of keys) {
            output += `\n${key}`;
        }
        return output + "\n";
    }
    static displayKeyNotFoundErrorMessage(key, dev) {
        return chalk.red(`Key "${key}" not found in the ${getKeystoreType(dev)} keystore`);
    }
    static displayKeyRemovedInfoMessage(key, dev) {
        return `Key "${key}" deleted from the ${getKeystoreType(dev)} keystore`;
    }
    static displayKeySetInfoMessage(key, dev) {
        return `Key "${key}" set in the ${getKeystoreType(dev)} keystore`;
    }
    static displayNoKeysInfoMessage(dev) {
        return `The ${getKeystoreType(dev)} keystore does not contain any keys.`;
    }
    static displayNoKeystoreSetErrorMessage(dev) {
        return `No ${getKeystoreType(dev)} keystore found. Please set one up using ${chalk.blue.italic(`npx hardhat keystore set {key}${dev === true ? " --dev" : ""}`)} `;
    }
    static displaySecretCannotBeEmptyErrorMessage() {
        return chalk.red("The value cannot be empty.");
    }
    static displayValueInfoMessage(value) {
        return `${value}`;
    }
    static enterSecretMessage(dev) {
        return `Enter secret to store in the ${getKeystoreType(dev)} keystore`;
    }
    static keystoreBannerMessage() {
        return "\n👷🔐 Hardhat Production Keystore 🔐👷\n";
    }
    static passwordSetUpMessage() {
        return "This is the first time you are using the production keystore, please set a password.";
    }
    static unlockBeforePasswordChangeMessage() {
        return "Unlock the production keystore using your current password before proceeding with the password change.";
    }
    static passwordChangeMessage() {
        return "Change your password.";
    }
    static passwordChangedSuccessMessage() {
        return "Password changed successfully!";
    }
    static passwordRequirementsMessage() {
        // return "The password must have at least 8 characters, one uppercase letter, one lowercase letter, and one special character.";
        return "The password must have at least 8 characters.";
    }
    static enterPasswordMsg() {
        return "Enter the password";
    }
    static passwordRequirementsError() {
        return "Invalid password! It does not meet the required criteria.";
    }
    static confirmPasswordMessage() {
        return "Please confirm your password";
    }
    static passwordsDoNotMatchError() {
        return "Passwords do not match!";
    }
}
//# sourceMappingURL=user-display-messages.js.map