"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notFoundHandler = exports.errorHandler = exports.requestLogger = exports.sensitiveOperationRateLimit = exports.passwordResetRateLimit = exports.authRateLimit = exports.securityMiddleware = void 0;
const tslib_1 = require("tslib");
const helmet_1 = tslib_1.__importDefault(require("helmet"));
const express_rate_limit_1 = tslib_1.__importDefault(require("express-rate-limit"));
/**
 * Security middleware configuration
 */
exports.securityMiddleware = [
    // Helmet for security headers
    (0, helmet_1.default)({
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                styleSrc: ["'self'", "'unsafe-inline'"],
                scriptSrc: ["'self'"],
                imgSrc: ["'self'", "data:", "https:"],
                connectSrc: ["'self'"],
                fontSrc: ["'self'"],
                objectSrc: ["'none'"],
                mediaSrc: ["'self'"],
                frameSrc: ["'none'"],
            },
        },
        crossOriginEmbedderPolicy: false,
        hsts: {
            maxAge: 31536000,
            includeSubDomains: true,
            preload: true
        }
    }),
    // Rate limiting temporarily disabled for Railway deployment
    // rateLimit({
    //   windowMs: 15 * 60 * 1000, // 15 minutes
    //   max: process.env.NODE_ENV === 'development' ? 1000 : 500, // More generous in development
    //   message: {
    //     success: false,
    //     error: 'Too many requests, please try again later'
    //   },
    //   standardHeaders: true,
    //   legacyHeaders: false,
    //   skip: (req) => {
    //     // Skip rate limiting for health checks and development
    //     return req.path === '/api/health' || process.env.NODE_ENV === 'development'
    //   }
    // }),
    // CORS configuration
    (req, res, next) => {
        const allowedOrigins = [
            'http://localhost:3000',
            'http://localhost:5173',
            'http://127.0.0.1:3000',
            'http://127.0.0.1:5173',
            'https://wata-mu.vercel.app',
            process.env.CORS_ORIGIN
        ];
        const origin = req.headers.origin;
        // Allow ngrok URLs in development
        const isNgrokUrl = origin && (origin.includes('.ngrok.io') ||
            origin.includes('.ngrok-free.app'));
        const isVercelUrl = origin && (origin.includes('.vercel.app') ||
            origin.includes('wata-mu.vercel.app'));
        if (allowedOrigins.includes(origin) || isNgrokUrl || isVercelUrl) {
            res.header('Access-Control-Allow-Origin', origin);
        }
        else if (process.env.NODE_ENV === 'development') {
            res.header('Access-Control-Allow-Origin', '*');
        }
        res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
        res.header('Access-Control-Allow-Credentials', 'true');
        res.header('Access-Control-Max-Age', '86400'); // 24 hours
        if (req.method === 'OPTIONS') {
            res.sendStatus(200);
        }
        else {
            next();
        }
    }
];
/**
 * Rate limiting for authentication endpoints
 */
exports.authRateLimit = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: process.env.NODE_ENV === 'development' ? 50 : 5, // More generous in development
    message: {
        success: false,
        error: 'Too many authentication attempts, please try again later'
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true,
    skip: (req) => {
        // Skip rate limiting in development
        return process.env.NODE_ENV === 'development';
    }
});
/**
 * Rate limiting for password reset endpoints
 */
exports.passwordResetRateLimit = (0, express_rate_limit_1.default)({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: process.env.NODE_ENV === 'development' ? 20 : 3,
    message: {
        success: false,
        error: 'Too many password reset attempts, please try again later'
    },
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => {
        // Skip rate limiting in development
        return process.env.NODE_ENV === 'development';
    }
});
/**
 * Rate limiting for sensitive operations
 */
exports.sensitiveOperationRateLimit = (0, express_rate_limit_1.default)({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: process.env.NODE_ENV === 'development' ? 100 : 10, // More generous in development
    message: {
        success: false,
        error: 'Too many sensitive operations, please try again later'
    },
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => {
        // Skip rate limiting in development
        return process.env.NODE_ENV === 'development';
    }
});
/**
 * Request logging middleware
 */
const requestLogger = (req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        const logData = {
            method: req.method,
            url: req.url,
            status: res.statusCode,
            duration: `${duration}ms`,
            ip: req.ip,
            userAgent: req.get('User-Agent'),
            timestamp: new Date().toISOString()
        };
        // Log only errors and slow requests
        if (res.statusCode >= 400 || duration > 1000) {
            console.log('Request:', JSON.stringify(logData));
        }
    });
    next();
};
exports.requestLogger = requestLogger;
/**
 * Error handling middleware
 */
const errorHandler = (err, req, res, next) => {
    console.error('Error:', err);
    // Don't leak error details in production
    const isDevelopment = process.env.NODE_ENV === 'development';
    res.status(500).json({
        success: false,
        error: isDevelopment ? err.message : 'Internal server error',
        ...(isDevelopment && { stack: err.stack })
    });
};
exports.errorHandler = errorHandler;
/**
 * 404 handler
 */
const notFoundHandler = (req, res) => {
    res.status(404).json({
        success: false,
        error: 'Endpoint not found',
        path: req.path,
        method: req.method
    });
};
exports.notFoundHandler = notFoundHandler;
//# sourceMappingURL=security.js.map