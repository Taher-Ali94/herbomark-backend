import mongoose, { Schema } from "mongoose";




const productSchema = new Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    category: { type: String, required: true },
    qty: { type: Number, required: true },
    imgSrc: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
});
export const Product = mongoose.model("Product", productSchema);