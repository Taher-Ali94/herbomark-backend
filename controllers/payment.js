import { Payment } from "../database/models/Payment.js";
import Razorpay from "razorpay";
import crypto from "crypto";

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export const checkout = async (req, res) => {
    try {
        const { amount, cartItems, userShipping } = req.body;

        if (!amount || typeof amount !== "number" || amount <= 0) {
            return res.status(400).json({ message: "Valid amount is required" });
        }
        if (!Array.isArray(cartItems) || cartItems.length === 0) {
            return res.status(400).json({ message: "cartItems must be a non-empty array" });
        }
        // amount should be in the smallest currency unit (paise for INR)
        const options = {
            amount,
            currency: "INR",
            receipt: `receipt_${Date.now()}`,
        };

        const order = await razorpay.orders.create(options);

        return res.status(200).json({
            orderId: order.id,
            amount,
            cartItems,
            userShipping,
            userId: req.user,
            payStatus: "created",
        });
    } catch (error) {
        return res.status(500).json({ message: "Failed to initiate checkout", error: error?.message || String(error) });
    }
};

export const verify = async (req, res) => {
    try {
        const { orderId, paymentId, signature, amount, orderItems, userShipping } = req.body;

        if (!orderId || !paymentId || !signature) {
            return res.status(400).json({ message: "orderId, paymentId and signature are required" });
        }

        const body = `${orderId}|${paymentId}`;
        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "")
            .update(body)
            .digest("hex");

        const isSignatureValid = expectedSignature === signature;
        if (!isSignatureValid) {
            return res.status(400).json({ message: "Invalid payment signature" });
        }

        const orderConfirm = await Payment.create({
            orderId,
            paymentId,
            signature,
            amount,
            orderItems,
            userId: req.user,
            userShipping,
            payStatus: "paid",
        });

        return res.status(200).json({ message: "Payment successful", success: true, orderConfirm });
    } catch (error) {
        return res.status(500).json({ message: "Payment verification failed", error: error?.message || String(error) });
    }
};


export const userOrder = async (req, res) => {
    try {
        const userId = req.user;
        const orders = await Payment.find({ userId }).sort({ orderDate: -1 });
        return res.status(200).json(orders);
    } catch (error) {
        return res.status(500).json({ message: "Failed to fetch user orders", error: error?.message || String(error) });
    }
}


export const allOrders = async (req, res) => {
    try {
        const orders = await Payment.find().sort({ orderDate: -1 });
        return res.status(200).json(orders);
    } catch (error) {
        return res.status(500).json({ message: "Failed to fetch orders", error: error?.message || String(error) });
    }
}