import { Router, Request, Response } from 'express'
import rateLimit from 'express-rate-limit'
import { AuthService } from '../services/auth.js'
import { Database } from '../database.js'
import { 
  validateUserRegistration, 
  validateUserLogin, 
  validatePasswordChange,
  validateUserProfileUpdate,
  handleValidationErrors,
  sanitizeInput,
  authRateLimit
} from '../middleware/validation.js'
import { AuthRequest } from '../middleware/auth.js'

const router = Router()

// Initialize services
const database = new Database()
const authService = new AuthService(database)
const authMiddleware = authService.getAuthMiddleware()

// Apply rate limiting to auth routes
const authLimiter = rateLimit(authRateLimit)

/**
 * POST /api/auth/register
 * Register a new user
 */
router.post('/register', 
  authLimiter,
  sanitizeInput,
  validateUserRegistration,
  handleValidationErrors,
  async (req: Request, res: Response) => {
    try {
      const { email, name, password, role, address } = req.body

      const result = await authService.register({
        email,
        name,
        password,
        role,
        address
      })

      if (result.success) {
        res.status(201).json({
          success: true,
          message: 'User registered successfully',
          data: {
            user: result.user,
            token: result.token,
            refreshToken: result.refreshToken
          }
        })
      } else {
        res.status(400).json({
          success: false,
          error: result.error
        })
      }
    } catch (error) {
      console.error('Registration error:', error)
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      })
    }
  }
)

/**
 * POST /api/auth/login
 * Login user
 */
router.post('/login',
  authLimiter,
  sanitizeInput,
  validateUserLogin,
  handleValidationErrors,
  async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body

      const result = await authService.login({ email, password })

      if (result.success) {
        res.json({
          success: true,
          message: 'Login successful',
          data: {
            user: result.user,
            token: result.token,
            refreshToken: result.refreshToken
          }
        })
      } else {
        res.status(401).json({
          success: false,
          error: result.error
        })
      }
    } catch (error) {
      console.error('Login error:', error)
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      })
    }
  }
)

/**
 * POST /api/auth/refresh
 * Refresh access token
 */
router.post('/refresh', async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body

    if (!refreshToken) {
      res.status(400).json({
        success: false,
        error: 'Refresh token is required'
      })
      return
    }

    const result = await authService.refreshToken(refreshToken)

    if (result.success) {
      res.json({
        success: true,
        message: 'Token refreshed successfully',
        data: {
          token: result.token,
          refreshToken: result.refreshToken
        }
      })
    } else {
      res.status(401).json({
        success: false,
        error: result.error
      })
    }
  } catch (error) {
    console.error('Token refresh error:', error)
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    })
  }
})

/**
 * GET /api/auth/profile
 * Get user profile (requires authentication)
 */
router.get('/profile',
  authMiddleware.authenticate,
  async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user!.id
      const result = await authService.getUserProfile(userId)

      if (result.success) {
        res.json({
          success: true,
          data: result.user
        })
      } else {
        res.status(404).json({
          success: false,
          error: result.error
        })
      }
    } catch (error) {
      console.error('Get profile error:', error)
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      })
    }
  }
)

/**
 * PUT /api/auth/profile
 * Update user profile (requires authentication)
 */
router.put('/profile',
  authMiddleware.authenticate,
  sanitizeInput,
  validateUserProfileUpdate,
  handleValidationErrors,
  async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user!.id
      const { name, address } = req.body

      // Update user in database
      await database.updateUser(userId, { name, address })

      // Get updated user
      const result = await authService.getUserProfile(userId)

      res.json({
        success: true,
        message: 'Profile updated successfully',
        data: result.user
      })
    } catch (error) {
      console.error('Update profile error:', error)
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      })
    }
  }
)

/**
 * POST /api/auth/change-password
 * Change user password (requires authentication)
 */
router.post('/change-password',
  authMiddleware.authenticate,
  sanitizeInput,
  validatePasswordChange,
  handleValidationErrors,
  async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user!.id
      const { currentPassword, newPassword } = req.body

      const result = await authService.changePassword(userId, currentPassword, newPassword)

      if (result.success) {
        res.json({
          success: true,
          message: 'Password changed successfully'
        })
      } else {
        res.status(400).json({
          success: false,
          error: result.error
        })
      }
    } catch (error) {
      console.error('Change password error:', error)
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      })
    }
  }
)

/**
 * POST /api/auth/logout
 * Logout user (client should discard tokens)
 */
router.post('/logout',
  authMiddleware.authenticate,
  async (req: AuthRequest, res: Response) => {
    try {
      // In a real application, you might want to blacklist the token
      // For now, we'll just return success and let the client handle token removal
      res.json({
        success: true,
        message: 'Logout successful'
      })
    } catch (error) {
      console.error('Logout error:', error)
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      })
    }
  }
)

/**
 * GET /api/auth/verify
 * Verify if token is valid
 */
router.get('/verify',
  authMiddleware.authenticate,
  async (req: AuthRequest, res: Response) => {
    try {
      res.json({
        success: true,
        message: 'Token is valid',
        data: {
          user: req.user
        }
      })
    } catch (error) {
      console.error('Token verification error:', error)
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      })
    }
  }
)

export default router
