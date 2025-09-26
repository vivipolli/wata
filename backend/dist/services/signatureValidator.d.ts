import type { SignedTransaction } from '../types';
export declare class SignatureValidator {
    /**
     * Validate a signed transaction
     */
    static validateSignature(signedTransaction: SignedTransaction): boolean;
    /**
     * Verify that the signature matches the expected message
     * Note: This is a simplified validation. In production, you would use
     * proper cryptographic signature verification with the user's public key
     */
    static verifySignatureMatch(signedTransaction: SignedTransaction): boolean;
    /**
     * Create the expected message for signature verification
     * This should match exactly what the frontend creates
     */
    private static createExpectedMessage;
    /**
     * Validate that the signer matches the producer address
     */
    static validateSignerMatch(signedTransaction: SignedTransaction): boolean;
    /**
     * Complete signature validation
     */
    static validateCompleteSignature(signedTransaction: SignedTransaction): {
        isValid: boolean;
        errors: string[];
    };
}
//# sourceMappingURL=signatureValidator.d.ts.map