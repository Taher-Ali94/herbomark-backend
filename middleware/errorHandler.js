import { logEvents } from "./logger.js";
import z from "zod";

/**
 * Centralized Error Handler for Herbomark Backend
 * Provides consistent error responses and logging
 */

// Error response format
const createErrorResponse = (message, statusCode = 500, details = null, errorId = null) => {
    return {
        success: false,
        message,
        statusCode,
        timestamp: new Date().toISOString(),
        ...(errorId && { errorId }),
        ...(details && { details })
    };
};

// Success response format
const createSuccessResponse = (data, message = null) => {
    return {
        success: true,
        data,
        ...(message && { message }),
        timestamp: new Date().toISOString()
    };
};

// Error classification
const classifyError = (error) => {
    // Validation errors
    if (error instanceof z.ZodError) {
        return { type: 'validation', statusCode: 400 };
    }
    
    // Mongoose validation errors
    if (error.name === 'ValidationError') {
        return { type: 'validation', statusCode: 400 };
    }
    
    // Mongoose duplicate key errors
    if (error.code === 11000) {
        return { type: 'duplicate', statusCode: 409 };
    }
    
    // Mongoose cast errors
    if (error.name === 'CastError') {
        return { type: 'invalid_id', statusCode: 400 };
    }
    
    // JWT errors
    if (error.name === 'JsonWebTokenError') {
        return { type: 'auth', statusCode: 401 };
    }
    
    if (error.name === 'TokenExpiredError') {
        return { type: 'auth', statusCode: 401 };
    }
    
    // Network errors
    if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
        return { type: 'network', statusCode: 503 };
    }
    
    // Default to server error
    return { type: 'server', statusCode: 500 };
};

// Get user-friendly error message
const getUserFriendlyMessage = (error, classification) => {
    switch (classification.type) {
        case 'validation':
            return 'Invalid input data. Please check your request and try again.';
        case 'duplicate':
            return 'A record with this information already exists.';
        case 'invalid_id':
            return 'Invalid ID format. Please provide a valid identifier.';
        case 'auth':
            return 'Authentication failed. Please log in again.';
        case 'network':
            return 'Service temporarily unavailable. Please try again later.';
        case 'server':
        default:
            return 'An internal server error occurred. Please try again later.';
    }
};

// Format validation errors
const formatValidationErrors = (error) => {
    if (error instanceof z.ZodError) {
        return error.issues.map(issue => ({
            field: issue.path.join('.'),
            message: issue.message,
            code: issue.code
        }));
    }
    
    if (error.name === 'ValidationError') {
        return Object.values(error.errors).map(err => ({
            field: err.path,
            message: err.message,
            code: err.kind
        }));
    }
    
    return [];
};

// Main error handler
const errorHandler = (err, req, res, next) => {
    const classification = classifyError(err);
    const errorId = `ERR_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Log the error
    const logMessage = `${err.name}: ${err.message}\t${req.method}\t${req.url}\t${req.headers.origin}\t${errorId}`;
    
    if (classification.type === 'validation') {
        logEvents(logMessage, "validationErrorLog.log");
    } else {
        logEvents(logMessage, "errorLog.log");
    }
    
    // Don't expose internal errors in production
    const isDevelopment = process.env.NODE_ENV === 'development';
    const isOperational = ['validation', 'duplicate', 'invalid_id', 'auth'].includes(classification.type);
    
    let message = getUserFriendlyMessage(err, classification);
    let details = null;
    
    // Add more details for validation errors
    if (classification.type === 'validation') {
        const validationErrors = formatValidationErrors(err);
        if (validationErrors.length > 0) {
            details = { validationErrors };
        }
    }
    
    // In development, include more error details
    if (isDevelopment) {
        message = err.message;
        details = {
            stack: err.stack,
            name: err.name,
            ...details
        };
    }
    
    // Don't expose sensitive information
    if (!isOperational && !isDevelopment) {
        message = 'An internal server error occurred. Please try again later.';
        details = null;
    }
    
    const response = createErrorResponse(message, classification.statusCode, details, errorId);
    
    res.status(classification.statusCode).json(response);
};

// 404 handler for undefined routes
const notFoundHandler = (req, res) => {
    const errorId = `ERR_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    logEvents(`404: Route not found\t${req.method}\t${req.url}\t${req.headers.origin}\t${errorId}`, "reqLog.log");
    
    const response = createErrorResponse(
        'The requested resource was not found.',
        404,
        { path: req.url, method: req.method },
        errorId
    );
    
    res.status(404).json(response);
};

// Async error wrapper
const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};

// Request validation middleware
const validateRequest = (schema) => {
    return (req, res, next) => {
        try {
            schema.parse(req.body);
            next();
        } catch (error) {
            if (error instanceof z.ZodError) {
                const response = createErrorResponse(
                    'Validation failed',
                    400,
                    { validationErrors: formatValidationErrors(error) }
                );
                return res.status(400).json(response);
            }
            next(error);
        }
    };
};

// Rate limiting error handler
const rateLimitHandler = (req, res) => {
    const errorId = `RATE_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    logEvents(`Rate limit exceeded\t${req.method}\t${req.url}\t${req.headers.origin}\t${errorId}`, "rateLimitLog.log");
    
    const response = createErrorResponse(
        'Too many requests. Please try again later.',
        429,
        { retryAfter: '15 minutes' },
        errorId
    );
    
    res.status(429).json(response);
};

export default errorHandler;
export { 
    notFoundHandler, 
    asyncHandler, 
    validateRequest, 
    rateLimitHandler,
    createErrorResponse,
    createSuccessResponse,
    classifyError,
    getUserFriendlyMessage
};