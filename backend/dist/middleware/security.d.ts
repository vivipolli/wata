import { Request, Response, NextFunction } from 'express';
/**
 * Security middleware configuration
 */
export declare const securityMiddleware: ((req: import("http").IncomingMessage, res: import("http").ServerResponse, next: (err?: unknown) => void) => void)[];
/**
 * Rate limiting for authentication endpoints
 */
export declare const authRateLimit: import("express-rate-limit").RateLimitRequestHandler;
/**
 * Rate limiting for password reset endpoints
 */
export declare const passwordResetRateLimit: import("express-rate-limit").RateLimitRequestHandler;
/**
 * Rate limiting for sensitive operations
 */
export declare const sensitiveOperationRateLimit: import("express-rate-limit").RateLimitRequestHandler;
/**
 * Request logging middleware
 */
export declare const requestLogger: (req: Request, res: Response, next: NextFunction) => void;
/**
 * Error handling middleware
 */
export declare const errorHandler: (err: Error, req: Request, res: Response, next: NextFunction) => void;
/**
 * 404 handler
 */
export declare const notFoundHandler: (req: Request, res: Response) => void;
//# sourceMappingURL=security.d.ts.map