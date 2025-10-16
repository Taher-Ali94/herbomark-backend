import mongoose from "mongoose";


export const connectDB = async () => {
    try {

        const mongoUrl = process.env.MONGO_URL;
        if (!mongoUrl) {
            throw new Error("Database URl undefined")
        }

        await mongoose.connect(mongoUrl);
    } catch (error) {
        console.log(error);
    }
}