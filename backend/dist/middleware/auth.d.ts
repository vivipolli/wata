import { Request, Response, NextFunction } from 'express';
import { PrismaDatabase } from '../services/orm/prismaDatabase';
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
    constructor(database: PrismaDatabase);
    /**
     * Middleware to authenticate JWT tokens
     */
    authenticate: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
    /**
     * Middleware to check if user has required role
     */
    requireRole: (requiredRoles: string | string[]) => (req: AuthRequest, res: Response, next: NextFunction) => void;
    /**
     * Middleware to check if user is producer
     */
    requireProducer: (req: AuthRequest, res: Response, next: NextFunction) => void;
    /**
     * Middleware to check if user is investor
     */
    requireInvestor: (req: AuthRequest, res: Response, next: NextFunction) => void;
    /**
     * Middleware to block producers from accessing all agreements route
     * Only MANAGER and INVESTOR can access GET /api/agreements
     */
    blockProducersFromAllAgreements: (req: AuthRequest, res: Response, next: NextFunction) => void;
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