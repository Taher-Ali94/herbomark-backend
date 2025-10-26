import { logEvents } from './logger.js';

// Request validation middleware
export const validateRequest = (requiredFields) => {
    return (req, res, next) => {
        const missingFields = requiredFields.filter(field => !req.body[field]);
        
        if (missingFields.length > 0) {
            logEvents(`Validation failed: Missing fields ${missingFields.join(', ')}\t${req.method}\t${req.url}\t${req.headers.origin}`, "errorLog.log");
            return res.status(400).json({
                message: 'Validation failed',
                missingFields: missingFields
            });
        }
        
        next();
    };
};

// Rate limiting middleware (simple implementation)
const requestCounts = new Map();

export const rateLimit = (maxRequests = 100, windowMs = 15 * 60 * 1000) => {
    return (req, res, next) => {
        const clientId = req.ip || req.connection.remoteAddress || 'unknown';
        const now = Date.now();
        
        const clientData = requestCounts.get(clientId);
        
        if (!clientData || now > clientData.resetTime) {
            requestCounts.set(clientId, { count: 1, resetTime: now + windowMs });
            return next();
        }
        
        if (clientData.count >= maxRequests) {
            logEvents(`Rate limit exceeded for ${clientId}\t${req.method}\t${req.url}\t${req.headers.origin}`, "errorLog.log");
            return res.status(429).json({
                message: 'Too many requests',
                retryAfter: Math.ceil((clientData.resetTime - now) / 1000)
            });
        }
        
        clientData.count++;
        next();
    };
};

// Security headers middleware
export const securityHeaders = (req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    
    if (process.env.NODE_ENV === 'production') {
        res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    }
    
    next();
};
