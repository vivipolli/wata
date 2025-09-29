"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const express_1 = require("express");
const express_rate_limit_1 = tslib_1.__importDefault(require("express-rate-limit"));
const auth_1 = require("../services/auth");
const database_1 = require("../database");
const validation_1 = require("../middleware/validation");
const router = (0, express_1.Router)();
// Initialize services
let database = null;
let authService = null;
let authMiddleware = null;
// Initialize database and services
const initializeServices = async () => {
    if (!database) {
        database = new database_1.Database();
        await database.initialize();
        authService = new auth_1.AuthService(database);
        authMiddleware = authService.getAuthMiddleware();
    }
};
// Apply rate limiting to auth routes
const authLimiter = (0, express_rate_limit_1.default)(validation_1.authRateLimit);
// Middleware wrapper to ensure services are initialized
const ensureAuthenticated = async (req, res, next) => {
    await initializeServices();
    return authMiddleware.authenticate(req, res, next);
};
/**
 * POST /api/auth/register
 * Register a new user
 */
router.post('/register', 
// authLimiter, // Temporarily disabled for testing
validation_1.sanitizeInput, validation_1.validateUserRegistration, validation_1.handleValidationErrors, async (req, res) => {
    try {
        await initializeServices(); // Ensure services are initialized
        const { email, name, password, role, address } = req.body;
        const result = await authService.register({
            email,
            name,
            password,
            role,
            address
        });
        if (result.success) {
            res.status(201).json({
                success: true,
                message: 'User registered successfully',
                data: {
                    user: result.user,
                    token: result.token,
                    refreshToken: result.refreshToken
                }
            });
        }
        else {
            res.status(400).json({
                success: false,
                error: result.error
            });
        }
    }
    catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});
/**
 * POST /api/auth/login
 * Login user
 */
router.post('/login', 
// authLimiter, // Temporarily disabled for testing
validation_1.sanitizeInput, validation_1.validateUserLogin, validation_1.handleValidationErrors, async (req, res) => {
    try {
        await initializeServices(); // Ensure services are initialized
        const { email, password } = req.body;
        const result = await authService.login({ email, password });
        if (result.success) {
            res.json({
                success: true,
                message: 'Login successful',
                data: {
                    user: result.user,
                    token: result.token,
                    refreshToken: result.refreshToken
                }
            });
        }
        else {
            res.status(401).json({
                success: false,
                error: result.error
            });
        }
    }
    catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});
/**
 * POST /api/auth/refresh
 * Refresh access token
 */
router.post('/refresh', async (req, res) => {
    try {
        await initializeServices(); // Ensure services are initialized
        const { refreshToken } = req.body;
        if (!refreshToken) {
            res.status(400).json({
                success: false,
                error: 'Refresh token is required'
            });
            return;
        }
        const result = await authService.refreshToken(refreshToken);
        if (result.success) {
            res.json({
                success: true,
                message: 'Token refreshed successfully',
                data: {
                    token: result.token,
                    refreshToken: result.refreshToken
                }
            });
        }
        else {
            res.status(401).json({
                success: false,
                error: result.error
            });
        }
    }
    catch (error) {
        console.error('Token refresh error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});
/**
 * GET /api/auth/profile
 * Get user profile (requires authentication)
 */
router.get('/profile', ensureAuthenticated, async (req, res) => {
    try {
        await initializeServices(); // Ensure services are initialized
        const userId = req.user.id;
        const result = await authService.getUserProfile(userId);
        if (result.success) {
            res.json({
                success: true,
                data: result.user
            });
        }
        else {
            res.status(404).json({
                success: false,
                error: result.error
            });
        }
    }
    catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});
/**
 * PUT /api/auth/profile
 * Update user profile (requires authentication)
 */
router.put('/profile', ensureAuthenticated, validation_1.sanitizeInput, validation_1.validateUserProfileUpdate, validation_1.handleValidationErrors, async (req, res) => {
    try {
        const userId = req.user.id;
        const { name, address } = req.body;
        // Update user in database
        await database.updateUser(userId, { name, address });
        // Get updated user
        const result = await authService.getUserProfile(userId);
        res.json({
            success: true,
            message: 'Profile updated successfully',
            data: result.user
        });
    }
    catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});
/**
 * POST /api/auth/change-password
 * Change user password (requires authentication)
 */
router.post('/change-password', ensureAuthenticated, validation_1.sanitizeInput, validation_1.validatePasswordChange, validation_1.handleValidationErrors, async (req, res) => {
    try {
        const userId = req.user.id;
        const { currentPassword, newPassword } = req.body;
        const result = await authService.changePassword(userId, currentPassword, newPassword);
        if (result.success) {
            res.json({
                success: true,
                message: 'Password changed successfully'
            });
        }
        else {
            res.status(400).json({
                success: false,
                error: result.error
            });
        }
    }
    catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});
/**
 * POST /api/auth/logout
 * Logout user (client should discard tokens)
 */
router.post('/logout', ensureAuthenticated, async (req, res) => {
    try {
        // In a real application, you might want to blacklist the token
        // For now, we'll just return success and let the client handle token removal
        res.json({
            success: true,
            message: 'Logout successful'
        });
    }
    catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});
/**
 * GET /api/auth/verify
 * Verify if token is valid
 */
router.get('/verify', ensureAuthenticated, async (req, res) => {
    try {
        res.json({
            success: true,
            message: 'Token is valid',
            data: {
                user: req.user
            }
        });
    }
    catch (error) {
        console.error('Token verification error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});
/**
 * PUT /api/auth/update-address
 * Update user wallet address
 */
router.put('/update-address', authLimiter, ensureAuthenticated, validation_1.sanitizeInput, async (req, res) => {
    try {
        const { address } = req.body;
        const userId = req.user.id;
        if (!address) {
            res.status(400).json({
                success: false,
                error: 'Wallet address is required'
            });
            return;
        }
        const result = await authService.updateUserAddress(userId, address);
        if (result.success) {
            res.json({
                success: true,
                message: 'Wallet address updated successfully',
                user: result.user
            });
        }
        else {
            res.status(400).json({
                success: false,
                error: result.error
            });
        }
    }
    catch (error) {
        console.error('Update address error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});
exports.default = router;
//# sourceMappingURL=auth.js.map