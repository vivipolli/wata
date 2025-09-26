import { body, validationResult } from 'express-validator';
/**
 * Middleware to handle validation errors
 */
export const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const errorMessages = errors.array().map(error => ({
            field: error.type === 'field' ? error.path : 'unknown',
            message: error.msg,
            value: error.type === 'field' ? error.value : undefined
        }));
        res.status(400).json({
            success: false,
            error: 'Validation failed',
            details: errorMessages
        });
        return;
    }
    next();
};
/**
 * Validation rules for user registration
 */
export const validateUserRegistration = [
    body('email')
        .isEmail()
        .withMessage('Must be a valid email address')
        .normalizeEmail()
        .isLength({ min: 5, max: 255 })
        .withMessage('Email must be between 5 and 255 characters'),
    body('name')
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Name must be between 2 and 100 characters')
        .matches(/^[a-zA-Z\s]+$/)
        .withMessage('Name can only contain letters and spaces'),
    body('password')
        .isLength({ min: 8, max: 128 })
        .withMessage('Password must be between 8 and 128 characters')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
        .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
    body('role')
        .isIn(['PRODUCER', 'INVESTOR'])
        .withMessage('Role must be one of: PRODUCER, INVESTOR'),
    body('address')
        .optional()
        .matches(/^0\.0\.\d+$/)
        .withMessage('Address must be a valid Hedera address format (0.0.123456)')
];
/**
 * Validation rules for user login
 */
export const validateUserLogin = [
    body('email')
        .isEmail()
        .withMessage('Must be a valid email address')
        .normalizeEmail(),
    body('password')
        .notEmpty()
        .withMessage('Password is required')
        .isLength({ min: 1, max: 128 })
        .withMessage('Password must be between 1 and 128 characters')
];
/**
 * Validation rules for password change
 */
export const validatePasswordChange = [
    body('currentPassword')
        .notEmpty()
        .withMessage('Current password is required'),
    body('newPassword')
        .isLength({ min: 8, max: 128 })
        .withMessage('New password must be between 8 and 128 characters')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
        .withMessage('New password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
    body('confirmPassword')
        .custom((value, { req }) => {
        if (value !== req.body.newPassword) {
            throw new Error('Password confirmation does not match new password');
        }
        return true;
    })
];
/**
 * Validation rules for user profile update
 */
export const validateUserProfileUpdate = [
    body('name')
        .optional()
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Name must be between 2 and 100 characters')
        .matches(/^[a-zA-Z\s]+$/)
        .withMessage('Name can only contain letters and spaces'),
    body('address')
        .optional()
        .matches(/^0\.0\.\d+$/)
        .withMessage('Address must be a valid Hedera address format (0.0.123456)')
];
/**
 * Sanitize input data
 */
export const sanitizeInput = (req, res, next) => {
    // Remove any potential XSS attempts
    const sanitizeString = (str) => {
        return str
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
            .replace(/<[^>]*>/g, '')
            .trim();
    };
    // Sanitize string fields
    if (req.body.email)
        req.body.email = sanitizeString(req.body.email);
    if (req.body.name)
        req.body.name = sanitizeString(req.body.name);
    if (req.body.address)
        req.body.address = sanitizeString(req.body.address);
    next();
};
/**
 * Rate limiting for authentication endpoints
 */
export const authRateLimit = {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 requests per windowMs
    message: {
        success: false,
        error: 'Too many authentication attempts, please try again later'
    },
    standardHeaders: true,
    legacyHeaders: false
};
/**
 * Rate limiting for general API endpoints
 */
export const apiRateLimit = {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: {
        success: false,
        error: 'Too many requests, please try again later'
    },
    standardHeaders: true,
    legacyHeaders: false
};
//# sourceMappingURL=validation.js.map