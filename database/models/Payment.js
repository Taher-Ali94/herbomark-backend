import mongoose, { Schema } from "mongoose";

const paymentItemSchema = new Schema(
    {
        productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
        title: { type: String, required: true },
        qty: { type: Number, min: 1, required: true },
        price: { type: Number, min: 0, required: true },
        imgSrc: { type: String },
    },
    { _id: false }
);

const addressSchema = new Schema(
    {
        fullName: { type: String },
        address: { type: String },
        city: { type: String },
        state: { type: String },
        country: { type: String },
        pincode: { type: String },
        phoneNumber: { type: String },
    },
    { _id: false }
);

const paymentSchema = new Schema(
    {
        orderId: { type: String, required: true, index: true, unique: true },
        paymentId: { type: String, index: true },
        signature: { type: String },
        amount: { type: Number, required: true, min: 1 },
        orderItems: { type: [paymentItemSchema], default: [] },
        userId: { type: Schema.Types.Mixed, required: true, index: true },
        userShipping: { type: addressSchema },
        orderDate: { type: Date, default: Date.now, required: true },
        payStatus: { type: String, enum: ["created", "paid", "failed", "refunded"], required: true },
    },
    { timestamps: true }
);

paymentSchema.index({ userId: 1, orderDate: -1 });

export const Payment = mongoose.model("Payment", paymentSchema);