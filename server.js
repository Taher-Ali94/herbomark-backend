import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import "dotenv/config";
import { connectDB } from './database/connectDB.js';
import { logger, logEvents } from './middleware/logger.js';
import errorHandler from './middleware/errorHandler.js';
import corsOptions from './common/corsOption.js';
import cookieParser from 'cookie-parser';
import userRouter from './routes/userRoutes.js';
import productRouter from './routes/productRoutes.js';

const port = process.env.PORT || 3500;

const app = express();

app.use(logger);
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

connectDB();


app.get("/", (req, res) => {
    res.json({
        message: "The server is active",
    });
});
app.use('/api/users', userRouter)
app.use('/api/products', productRouter)





app.use(errorHandler);



mongoose.connection.once("open", () => {
    console.log("connected to the database");
    app.listen(port, () => { console.log(`server is live on port ${port}`) });
})

mongoose.connection.on("error", (err) => {
    console.log(err)
    logEvents(`${err.no}: ${err.code}\t${err.syscall}\t${err.hostname}`, 'mongoErrLog.log')
})