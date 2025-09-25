import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import { Request, Response, NextFunction } from 'express'

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

  // Rate limiting for API endpoints
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: {
      success: false,
      error: 'Too many requests, please try again later'
    },
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => {
      // Skip rate limiting for health checks
      return req.path === '/api/health'
    }
  }),

  // CORS configuration
  (req: Request, res: Response, next: NextFunction) => {
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:5173',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:5173'
    ]
    
    const origin = req.headers.origin
    if (allowedOrigins.includes(origin as string)) {
      res.header('Access-Control-Allow-Origin', origin)
    } else if (process.env.NODE_ENV === 'development') {
      res.header('Access-Control-Allow-Origin', '*')
    }
    
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization')
    res.header('Access-Control-Allow-Credentials', 'true')
    res.header('Access-Control-Max-Age', '86400') // 24 hours
    
    if (req.method === 'OPTIONS') {
      res.sendStatus(200)
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
  max: 5, // Limit each IP to 5 auth requests per windowMs
  message: {
    success: false,
    error: 'Too many authentication attempts, please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true
})

/**
 * Rate limiting for password reset endpoints
 */
export const passwordResetRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // Limit each IP to 3 password reset attempts per hour
  message: {
    success: false,
    error: 'Too many password reset attempts, please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false
})

/**
 * Rate limiting for sensitive operations
 */
export const sensitiveOperationRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // Limit each IP to 10 sensitive operations per hour
  message: {
    success: false,
    error: 'Too many sensitive operations, please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false
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
