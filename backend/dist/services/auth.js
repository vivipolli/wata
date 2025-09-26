import bcrypt from 'bcrypt';
import { AuthMiddleware } from '../middleware/auth.js';
export class AuthService {
    database;
    authMiddleware;
    saltRounds;
    constructor(database) {
        this.database = database;
        this.authMiddleware = new AuthMiddleware(database);
        this.saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || '12');
    }
    /**
     * Register a new user
     */
    async register(userData) {
        try {
            // Check if user already exists
            const existingUser = await this.database.getUserByEmail(userData.email);
            if (existingUser) {
                return {
                    success: false,
                    error: 'User with this email already exists'
                };
            }
            // Hash password
            const hashedPassword = await bcrypt.hash(userData.password, this.saltRounds);
            // Create user in database
            const userId = await this.database.createUser({
                email: userData.email,
                name: userData.name,
                password: hashedPassword,
                role: userData.role,
                address: userData.address,
                isActive: true,
                createdAt: new Date().toISOString()
            });
            // Get created user
            const user = await this.database.getUserById(userId);
            if (!user) {
                return {
                    success: false,
                    error: 'Failed to create user'
                };
            }
            // Generate tokens
            const token = this.authMiddleware.generateToken({
                id: user.id,
                email: user.email,
                role: user.role
            });
            const refreshToken = this.authMiddleware.generateRefreshToken({
                id: user.id,
                email: user.email
            });
            return {
                success: true,
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                    address: user.address
                },
                token,
                refreshToken
            };
        }
        catch (error) {
            console.error('Registration error:', error);
            return {
                success: false,
                error: 'Registration failed'
            };
        }
    }
    /**
     * Login user
     */
    async login(credentials) {
        try {
            // Get user by email
            const user = await this.database.getUserByEmail(credentials.email);
            if (!user) {
                return {
                    success: false,
                    error: 'Invalid email or password'
                };
            }
            // Check if user is active
            if (!user.is_active) {
                return {
                    success: false,
                    error: 'Account is deactivated'
                };
            }
            // Verify password
            const isPasswordValid = await bcrypt.compare(credentials.password, user.password);
            if (!isPasswordValid) {
                return {
                    success: false,
                    error: 'Invalid email or password'
                };
            }
            // Update last login
            await this.database.updateUserLastLogin(user.id);
            // Generate tokens
            const token = this.authMiddleware.generateToken({
                id: user.id,
                email: user.email,
                role: user.role
            });
            const refreshToken = this.authMiddleware.generateRefreshToken({
                id: user.id,
                email: user.email
            });
            return {
                success: true,
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                    address: user.address
                },
                token,
                refreshToken
            };
        }
        catch (error) {
            console.error('Login error:', error);
            return {
                success: false,
                error: 'Login failed'
            };
        }
    }
    /**
     * Refresh access token
     */
    async refreshToken(refreshToken) {
        try {
            const decoded = this.authMiddleware.verifyRefreshToken(refreshToken);
            if (!decoded) {
                return {
                    success: false,
                    error: 'Invalid refresh token'
                };
            }
            // Get user from database
            const user = await this.database.getUserById(decoded.userId);
            if (!user || !user.is_active) {
                return {
                    success: false,
                    error: 'User not found or inactive'
                };
            }
            // Generate new tokens
            const newToken = this.authMiddleware.generateToken({
                id: user.id,
                email: user.email,
                role: user.role
            });
            const newRefreshToken = this.authMiddleware.generateRefreshToken({
                id: user.id,
                email: user.email
            });
            return {
                success: true,
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                    address: user.address
                },
                token: newToken,
                refreshToken: newRefreshToken
            };
        }
        catch (error) {
            console.error('Token refresh error:', error);
            return {
                success: false,
                error: 'Token refresh failed'
            };
        }
    }
    /**
     * Change user password
     */
    async changePassword(userId, currentPassword, newPassword) {
        try {
            // Get user
            const user = await this.database.getUserById(userId);
            if (!user) {
                return {
                    success: false,
                    error: 'User not found'
                };
            }
            // Verify current password
            const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
            if (!isCurrentPasswordValid) {
                return {
                    success: false,
                    error: 'Current password is incorrect'
                };
            }
            // Hash new password
            const hashedNewPassword = await bcrypt.hash(newPassword, this.saltRounds);
            // Update password in database
            await this.database.updateUserPassword(userId, hashedNewPassword);
            return {
                success: true
            };
        }
        catch (error) {
            console.error('Password change error:', error);
            return {
                success: false,
                error: 'Password change failed'
            };
        }
    }
    /**
     * Get user profile
     */
    async getUserProfile(userId) {
        try {
            const user = await this.database.getUserById(userId);
            if (!user) {
                return {
                    success: false,
                    error: 'User not found'
                };
            }
            return {
                success: true,
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                    address: user.address
                }
            };
        }
        catch (error) {
            console.error('Get profile error:', error);
            return {
                success: false,
                error: 'Failed to get user profile'
            };
        }
    }
    /**
     * Update user wallet address
     */
    async updateUserAddress(userId, address) {
        try {
            // Validate address format (basic validation)
            if (!address || address.length < 10) {
                return {
                    success: false,
                    error: 'Invalid wallet address format'
                };
            }
            // Check if user exists
            const user = await this.database.getUserById(userId);
            if (!user) {
                return {
                    success: false,
                    error: 'User not found'
                };
            }
            // Update user address
            await this.database.updateUserAddress(userId, address);
            // Get updated user
            const updatedUser = await this.database.getUserById(userId);
            return {
                success: true,
                user: {
                    id: updatedUser.id,
                    email: updatedUser.email,
                    name: updatedUser.name,
                    role: updatedUser.role,
                    address: updatedUser.address
                }
            };
        }
        catch (error) {
            console.error('Update user address error:', error);
            return {
                success: false,
                error: 'Failed to update wallet address'
            };
        }
    }
    /**
     * Get auth middleware instance
     */
    getAuthMiddleware() {
        return this.authMiddleware;
    }
}
//# sourceMappingURL=auth.js.map