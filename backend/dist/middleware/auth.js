"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthMiddleware = void 0;
const tslib_1 = require("tslib");
const jsonwebtoken_1 = tslib_1.__importDefault(require("jsonwebtoken"));
class AuthMiddleware {
    database;
    jwtSecret;
    constructor(database) {
        this.database = database;
        this.jwtSecret = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
    }
    /**
     * Middleware to authenticate JWT tokens
     */
    authenticate = async (req, res, next) => {
        try {
            const authHeader = req.headers.authorization;
            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                res.status(401).json({
                    success: false,
                    error: 'Access token required'
                });
                return;
            }
            const token = authHeader.substring(7); // Remove 'Bearer ' prefix
            // Verify JWT token
            const decoded = jsonwebtoken_1.default.verify(token, this.jwtSecret);
            // Get user from database to ensure they still exist and are active
            const user = await this.database.getUserById(decoded.userId);
            if (!user) {
                res.status(401).json({
                    success: false,
                    error: 'Invalid token - user not found'
                });
                return;
            }
            // SECURITY CHECK: Verify email matches between token and database
            if (user.email !== decoded.email) {
                console.error('🚨 SECURITY ALERT: Email mismatch!', {
                    tokenEmail: decoded.email,
                    dbEmail: user.email,
                    userId: decoded.userId
                });
                res.status(401).json({
                    success: false,
                    error: 'Token email does not match database user'
                });
                return;
            }
            // Attach user info to request
            req.user = {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                address: user.address
            };
            next();
        }
        catch (error) {
            if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
                res.status(401).json({
                    success: false,
                    error: 'Invalid token'
                });
            }
            else if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
                res.status(401).json({
                    success: false,
                    error: 'Token expired'
                });
            }
            else {
                console.error('Auth middleware error:', error);
                res.status(500).json({
                    success: false,
                    error: 'Authentication failed'
                });
            }
        }
    };
    /**
     * Middleware to check if user has required role
     */
    requireRole = (requiredRoles) => {
        return (req, res, next) => {
            if (!req.user) {
                res.status(401).json({
                    success: false,
                    error: 'Authentication required'
                });
                return;
            }
            const userRole = req.user.role;
            const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
            if (!roles.includes(userRole)) {
                res.status(403).json({
                    success: false,
                    error: 'Insufficient permissions',
                    required: roles,
                    current: userRole
                });
                return;
            }
            next();
        };
    };
    /**
     * Middleware to check if user is producer
     */
    requireProducer = (req, res, next) => {
        if (!req.user) {
            res.status(401).json({
                success: false,
                error: 'Authentication required'
            });
            return;
        }
        if (req.user.role !== 'PRODUCER') {
            res.status(403).json({
                success: false,
                error: 'Producer access required'
            });
            return;
        }
        next();
    };
    /**
     * Middleware to check if user is investor
     */
    requireInvestor = (req, res, next) => {
        if (!req.user) {
            res.status(401).json({
                success: false,
                error: 'Authentication required'
            });
            return;
        }
        if (req.user.role !== 'INVESTOR') {
            res.status(403).json({
                success: false,
                error: 'Investor access required'
            });
            return;
        }
        next();
    };
    /**
     * Middleware to block producers from accessing all agreements route
     * Only MANAGER and INVESTOR can access GET /api/agreements
     */
    blockProducersFromAllAgreements = (req, res, next) => {
        if (!req.user) {
            res.status(401).json({
                success: false,
                error: 'Authentication required'
            });
            return;
        }
        // Block producers from accessing all agreements
        if (req.user.role === 'PRODUCER') {
            res.status(403).json({
                success: false,
                error: 'Producers cannot access all agreements. Use specific producer route instead.',
                message: 'For security reasons, producers can only access their own agreements via /api/agreements/producer/:address'
            });
            return;
        }
        // Allow MANAGER and INVESTOR
        if (req.user.role === 'MANAGER' || req.user.role === 'INVESTOR') {
            next();
            return;
        }
        // Block any other roles
        res.status(403).json({
            success: false,
            error: 'Insufficient permissions to access all agreements',
            required: ['MANAGER', 'INVESTOR'],
            current: req.user.role
        });
    };
    /**
     * Generate JWT token for user
     */
    generateToken(user) {
        const payload = {
            userId: user.id,
            email: user.email,
            role: user.role
        };
        return jsonwebtoken_1.default.sign(payload, this.jwtSecret, {
            expiresIn: process.env.JWT_EXPIRES_IN || '24h',
            issuer: 'wata-chain',
            audience: 'wata-users'
        });
    }
    /**
     * Generate refresh token (longer expiration)
     */
    generateRefreshToken(user) {
        const payload = {
            userId: user.id,
            email: user.email,
            type: 'refresh'
        };
        return jsonwebtoken_1.default.sign(payload, this.jwtSecret, {
            expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
            issuer: 'wata-chain',
            audience: 'wata-users'
        });
    }
    /**
     * Verify refresh token
     */
    verifyRefreshToken(token) {
        try {
            const decoded = jsonwebtoken_1.default.verify(token, this.jwtSecret);
            return decoded;
        }
        catch (error) {
            return null;
        }
    }
}
exports.AuthMiddleware = AuthMiddleware;
//# sourceMappingURL=auth.js.map