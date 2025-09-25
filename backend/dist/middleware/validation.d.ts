import { Request, Response, NextFunction } from 'express';
import { ValidationChain } from 'express-validator';
/**
 * Middleware to handle validation errors
 */
export declare const handleValidationErrors: (req: Request, res: Response, next: NextFunction) => void;
/**
 * Validation rules for user registration
 */
export declare const validateUserRegistration: ValidationChain[];
/**
 * Validation rules for user login
 */
export declare const validateUserLogin: ValidationChain[];
/**
 * Validation rules for password change
 */
export declare const validatePasswordChange: ValidationChain[];
/**
 * Validation rules for user profile update
 */
export declare const validateUserProfileUpdate: ValidationChain[];
/**
 * Sanitize input data
 */
export declare const sanitizeInput: (req: Request, res: Response, next: NextFunction) => void;
/**
 * Rate limiting for authentication endpoints
 */
export declare const authRateLimit: {
    windowMs: number;
    max: number;
    message: {
        success: boolean;
        error: string;
    };
    standardHeaders: boolean;
    legacyHeaders: boolean;
};
/**
 * Rate limiting for general API endpoints
 */
export declare const apiRateLimit: {
    windowMs: number;
    max: number;
    message: {
        success: boolean;
        error: string;
    };
    standardHeaders: boolean;
    legacyHeaders: boolean;
};
//# sourceMappingURL=validation.d.ts.map