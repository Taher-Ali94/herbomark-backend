import mongoose, { Schema } from "mongoose";

const cartItemSchema = new Schema({
    productId: {
        type: Schema.Types.ObjectId,
        ref: "Product",
        required: true,
    },
    title: { type: String, required: true },
    price: { type: Number, required: true },
    qty: { type: Number, required: true },
    imgSrc: { type: String, required: true },
});

const cartSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    items: [cartItemSchema],
});

export const Cart = mongoose.model("Cart", cartSchema);