import { Database } from '../database.js';
import { AuthMiddleware } from '../middleware/auth.js';
export interface LoginCredentials {
    email: string;
    password: string;
}
export interface RegisterData {
    email: string;
    name: string;
    password: string;
    role: string;
    address?: string;
}
export interface AuthResponse {
    success: boolean;
    user?: {
        id: number;
        email: string;
        name: string;
        role: string;
        address?: string;
    };
    token?: string;
    refreshToken?: string;
    error?: string;
}
export declare class AuthService {
    private database;
    private authMiddleware;
    private saltRounds;
    constructor(database: Database);
    /**
     * Register a new user
     */
    register(userData: RegisterData): Promise<AuthResponse>;
    /**
     * Login user
     */
    login(credentials: LoginCredentials): Promise<AuthResponse>;
    /**
     * Refresh access token
     */
    refreshToken(refreshToken: string): Promise<AuthResponse>;
    /**
     * Change user password
     */
    changePassword(userId: number, currentPassword: string, newPassword: string): Promise<AuthResponse>;
    /**
     * Get user profile
     */
    getUserProfile(userId: number): Promise<AuthResponse>;
    /**
     * Get auth middleware instance
     */
    getAuthMiddleware(): AuthMiddleware;
}
//# sourceMappingURL=auth.d.ts.map