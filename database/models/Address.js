import mongoose, { Schema } from "mongoose";

const addressSchema = new Schema({
    userId: {
        type: String,
        required: true,
    },
    fullName: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    country: { type: String, required: true },
    pincode: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
});

export const Address = mongoose.model("Address", addressSchema);


