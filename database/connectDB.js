import mongoose from "mongoose";
import { logEvents } from "../middleware/logger.js";

export const connectDB = async () => {
    try {
        const mongoUrl = process.env.MONGODB_URI || process.env.MONGO_URL || "mongodb://localhost:27017/herbomark";
        
        await mongoose.connect(mongoUrl);
        logEvents("Database connected successfully", "reqLog.log");
    } catch (error) {
        logEvents(`Database connection error: ${error.message}`, "errorLog.log");
        throw error;
    }
}