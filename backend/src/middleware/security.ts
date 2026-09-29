import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import { Request, Response, NextFunction } from 'express'

const DEVELOPMENT_ORIGINS = [
  'http://localhost:3000',
  'http://localhost:5173',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:5173'
]

function readPositiveInt(name: string, fallback: number): number {
  const raw = process.env[name]
  if (raw === undefined || raw === '') return fallback
  const parsed = Number.parseInt(raw, 10)
  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new Error(`${name} must be a positive integer`)
  }
  return parsed
}

/**
 * Origins allowed to call the API. Read from ALLOWED_ORIGINS (comma-separated, exact URLs).
 * CORS_ORIGIN (single value) is still honoured for backwards compatibility.
 * Local dev origins are added only when NODE_ENV === 'development'.
 */
export function getAllowedOrigins(): string[] {
  const configured = [process.env.ALLOWED_ORIGINS, process.env.CORS_ORIGIN]
    .filter((value): value is string => Boolean(value))
    .flatMap((value) => value.split(','))
    .map((value) => value.trim())
    .filter((value) => value.length > 0)

  const origins = process.env.NODE_ENV === 'development'
    ? [...configured, ...DEVELOPMENT_ORIGINS]
    : configured

  return Array.from(new Set(origins))
}

/**
 * Security middleware configuration
 */
export const securityMiddleware = [
  // Helmet for security headers
  helmet({
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

  // Global rate limiting (configurable via RATE_LIMIT_WINDOW_MS / RATE_LIMIT_MAX_REQUESTS)
  rateLimit({
    windowMs: readPositiveInt('RATE_LIMIT_WINDOW_MS', 15 * 60 * 1000),
    limit: readPositiveInt('RATE_LIMIT_MAX_REQUESTS', 300),
    message: {
      success: false,
      error: 'Too many requests, please try again later'
    },
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => req.path === '/api/health'
  }),

  // CORS: exact-match allowlist only. No platform wildcards (*.vercel.app, ngrok).
  (req: Request, res: Response, next: NextFunction) => {
    const origin = req.headers.origin
    const allowedOrigins = getAllowedOrigins()
    const isAllowed = typeof origin === 'string' && allowedOrigins.includes(origin)

    if (isAllowed) {
      res.header('Access-Control-Allow-Origin', origin)
      res.header('Vary', 'Origin')
      res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
      res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization')
      res.header('Access-Control-Max-Age', '86400') // 24 hours
    }

    if (req.method === 'OPTIONS') {
      res.sendStatus(isAllowed ? 204 : 403)
    } else {
      next()
    }
  }
]

/**
 * Rate limiting for authentication endpoints
 */
export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: process.env.NODE_ENV === 'development' ? 1000 : readPositiveInt('AUTH_RATE_LIMIT_MAX_REQUESTS', 5),
  message: {
    success: false,
    error: 'Too many authentication attempts, please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  skip: (req) => {
    // Skip rate limiting in development
    return process.env.NODE_ENV === 'development'
  }
})

/**
 * Rate limiting for password reset endpoints
 */
export const passwordResetRateLimit = rateLimit({
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
    return process.env.NODE_ENV === 'development'
  }
})

/**
 * Rate limiting for sensitive operations
 */
export const sensitiveOperationRateLimit = rateLimit({
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
    return process.env.NODE_ENV === 'development'
  }
})

/**
 * Request logging middleware
 */
export const requestLogger = (req: Request, res: Response, next: NextFunction): void => {
  const start = Date.now()
  
  res.on('finish', () => {
    const duration = Date.now() - start
    const logData = {
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      timestamp: new Date().toISOString()
    }
    
    // Log only errors and slow requests
    if (res.statusCode >= 400 || duration > 1000) {
      console.log('Request:', JSON.stringify(logData))
    }
  })
  
  next()
}

/**
 * Error handling middleware
 */
export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction): void => {
  console.error('Error:', err)
  
  // Don't leak error details in production
  const isDevelopment = process.env.NODE_ENV === 'development'
  
  res.status(500).json({
    success: false,
    error: isDevelopment ? err.message : 'Internal server error',
    ...(isDevelopment && { stack: err.stack })
  })
}

/**
 * 404 handler
 */
export const notFoundHandler = (req: Request, res: Response): void => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    path: req.path,
    method: req.method
  })
}
