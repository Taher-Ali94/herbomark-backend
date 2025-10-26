import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import "dotenv/config";
import { connectDB } from './database/connectDB.js';
import { logger, logEvents } from './middleware/logger.js';
import errorHandler from './middleware/errorHandler.js';
import { securityHeaders, rateLimit } from './middleware/security.js';
import corsOptions from './common/corsOption.js';
import cookieParser from 'cookie-parser';
import userRouter from './routes/userRoutes.js';
import productRouter from './routes/productRoutes.js';
import cartRouter from './routes/cartRouter.js';
import addressRouter from './routes/addressRouter.js';
import paymentRouter from './routes/paymentRouter.js';

const port = process.env.PORT || 3500;

const app = express();

app.use(securityHeaders);
app.use(rateLimit(100, 15 * 60 * 1000)); // 100 requests per 15 minutes
app.use(logger);
app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

connectDB();


app.get("/", (req, res) => {
    res.json({
        message: "The server is active",
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        version: '1.0.0'
    });
});

app.get("/health", (req, res) => {
    res.json({
        status: "healthy",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development'
    });
});
app.use('/api/users', userRouter)
app.use('/api/products', productRouter)
app.use('/api/cart', cartRouter)
app.use('/api/address', addressRouter)
app.use('/api/payments', paymentRouter)





app.use(errorHandler);



mongoose.connection.once("open", () => {
    logEvents("Connected to the database", "reqLog.log");
    app.listen(port, () => { 
        logEvents(`Server is live on port ${port}`, "reqLog.log");
    });
})

mongoose.connection.on("error", (err) => {
    logEvents(`MongoDB connection error: ${err.message}`, "errorLog.log");
    logEvents(`${err.no}: ${err.code}\t${err.syscall}\t${err.hostname}`, 'mongoErrLog.log')
})