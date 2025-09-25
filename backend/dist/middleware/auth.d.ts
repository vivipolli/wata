import { Request, Response, NextFunction } from 'express';
import { Database } from '../database.js';
interface AuthRequest extends Request {
    user?: {
        id: number;
        email: string;
        name: string;
        role: string;
        address?: string;
    };
}
interface JwtPayload {
    userId: number;
    email: string;
    role: string;
    iat: number;
    exp: number;
}
export declare class AuthMiddleware {
    private database;
    private jwtSecret;
    constructor(database: Database);
    /**
     * Middleware to authenticate JWT tokens
     */
    authenticate: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
    /**
     * Middleware to check if user has required role
     */
    requireRole: (requiredRoles: string | string[]) => (req: AuthRequest, res: Response, next: NextFunction) => void;
    /**
     * Middleware to check if user is admin
     */
    requireAdmin: (req: AuthRequest, res: Response, next: NextFunction) => void;
    /**
     * Generate JWT token for user
     */
    generateToken(user: {
        id: number;
        email: string;
        role: string;
    }): string;
    /**
     * Generate refresh token (longer expiration)
     */
    generateRefreshToken(user: {
        id: number;
        email: string;
    }): string;
    /**
     * Verify refresh token
     */
    verifyRefreshToken(token: string): JwtPayload | null;
}
export { AuthRequest };
//# sourceMappingURL=auth.d.ts.map