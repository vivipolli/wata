import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { PrismaDatabase } from '../services/orm/prismaDatabase'

interface AuthRequest extends Request {
  user?: {
    id: number
    email: string
    name: string
    role: string
    address?: string
  }
}

interface JwtPayload {
  userId: number
  email: string
  role?: string
  type?: 'refresh'
  iat: number
  exp: number
}

const JWT_ISSUER = 'wata-chain'
const JWT_AUDIENCE = 'wata-users'
const JWT_ALGORITHM: jwt.Algorithm = 'HS256'
const MIN_JWT_SECRET_LENGTH = 32

/**
 * Reads JWT_SECRET from the environment and refuses to start without a strong value.
 * There is intentionally no fallback: a default secret committed to the repo would let
 * anyone forge tokens.
 */
export function loadJwtSecret(): string {
  const secret = process.env.JWT_SECRET
  if (!secret || secret.length < MIN_JWT_SECRET_LENGTH) {
    throw new Error(
      `JWT_SECRET must be set and at least ${MIN_JWT_SECRET_LENGTH} characters long`
    )
  }
  return secret
}

export class AuthMiddleware {
  private database: PrismaDatabase
  private jwtSecret: string

  constructor(database: PrismaDatabase) {
    this.database = database
    this.jwtSecret = loadJwtSecret()
  }

  /**
   * Middleware to authenticate JWT tokens
   */
  authenticate = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authHeader = req.headers.authorization
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({
          success: false,
          error: 'Access token required'
        })
        return
      }

      const token = authHeader.substring(7) // Remove 'Bearer ' prefix
      
      // Verify JWT token
      const decoded = jwt.verify(token, this.jwtSecret, {
        algorithms: [JWT_ALGORITHM],
        issuer: JWT_ISSUER,
        audience: JWT_AUDIENCE
      }) as JwtPayload

      // Refresh tokens must only be accepted by the refresh endpoint
      if (decoded.type === 'refresh') {
        res.status(401).json({
          success: false,
          error: 'Invalid token'
        })
        return
      }
      
      // Get user from database to ensure they still exist and are active
      const user = await this.database.getUserById(decoded.userId)
      
      if (!user || !user.is_active) {
        res.status(401).json({
          success: false,
          error: 'Invalid token - user not found or inactive'
        })
        return
      }

      // SECURITY CHECK: Verify email matches between token and database
      if (user.email !== decoded.email) {
        console.error('🚨 SECURITY ALERT: Email mismatch!', {
          tokenEmail: decoded.email,
          dbEmail: user.email,
          userId: decoded.userId
        })
        res.status(401).json({
          success: false,
          error: 'Token email does not match database user'
        })
        return
      }

      // Attach user info to request
      req.user = {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        address: user.address
      }

      next()
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        res.status(401).json({
          success: false,
          error: 'Invalid token'
        })
      } else if (error instanceof jwt.TokenExpiredError) {
        res.status(401).json({
          success: false,
          error: 'Token expired'
        })
      } else {
        console.error('Auth middleware error:', error)
        res.status(500).json({
          success: false,
          error: 'Authentication failed'
        })
      }
    }
  }

  /**
   * Middleware to check if user has required role
   */
  requireRole = (requiredRoles: string | string[]) => {
    return (req: AuthRequest, res: Response, next: NextFunction): void => {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Authentication required'
        })
        return
      }

      const userRole = req.user.role
      const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles]

      if (!roles.includes(userRole)) {
        res.status(403).json({
          success: false,
          error: 'Insufficient permissions',
          required: roles,
          current: userRole
        })
        return
      }

      next()
    }
  }

  /**
   * Middleware to check if user is producer
   */
  requireProducer = (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required'
      })
      return
    }

    if (req.user.role !== 'PRODUCER') {
      res.status(403).json({
        success: false,
        error: 'Producer access required'
      })
      return
    }

    next()
  }

  /**
   * Middleware to check if user is investor
   */
  requireInvestor = (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required'
      })
      return
    }

    if (req.user.role !== 'INVESTOR') {
      res.status(403).json({
        success: false,
        error: 'Investor access required'
      })
      return
    }

    next()
  }

  /**
   * Middleware to block producers from accessing all agreements route
   * Only MANAGER and INVESTOR can access GET /api/agreements
   */
  blockProducersFromAllAgreements = (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required'
      })
      return
    }

    // Block producers from accessing all agreements
    if (req.user.role === 'PRODUCER') {
      res.status(403).json({
        success: false,
        error: 'Producers cannot access all agreements. Use specific producer route instead.',
        message: 'For security reasons, producers can only access their own agreements via /api/agreements/producer/:address'
      })
      return
    }

    // Allow MANAGER and INVESTOR
    if (req.user.role === 'MANAGER' || req.user.role === 'INVESTOR') {
      next()
      return
    }

    // Block any other roles
    res.status(403).json({
      success: false,
      error: 'Insufficient permissions to access all agreements',
      required: ['MANAGER', 'INVESTOR'],
      current: req.user.role
    })
  }

  /**
   * Generate JWT token for user
   */
  generateToken(user: { id: number; email: string; role: string }): string {
    const payload = {
      userId: user.id,
      email: user.email,
      role: user.role
    }

    return jwt.sign(payload, this.jwtSecret, {
      algorithm: JWT_ALGORITHM,
      expiresIn: process.env.JWT_EXPIRES_IN || '24h',
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE
    } as jwt.SignOptions)
  }

  /**
   * Generate refresh token (longer expiration)
   */
  generateRefreshToken(user: { id: number; email: string }): string {
    const payload = {
      userId: user.id,
      email: user.email,
      type: 'refresh'
    }

    return jwt.sign(payload, this.jwtSecret, {
      algorithm: JWT_ALGORITHM,
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE
    } as jwt.SignOptions)
  }

  /**
   * Verify refresh token
   */
  verifyRefreshToken(token: string): JwtPayload | null {
    try {
      const decoded = jwt.verify(token, this.jwtSecret, {
        algorithms: [JWT_ALGORITHM],
        issuer: JWT_ISSUER,
        audience: JWT_AUDIENCE
      }) as JwtPayload
      // Only refresh tokens are valid here; access tokens must not mint new sessions
      if (decoded.type !== 'refresh') {
        return null
      }
      return decoded
    } catch (error) {
      return null
    }
  }
}

export { AuthRequest }
