import { Router } from "express";
import verifyJwt from "../middleware/verifyJWT.js";
import verifyAdmin from "../middleware/verifyAdmin.js";
import { checkout, verify, userOrder, allOrders } from "../controllers/payment.js";

const paymentRouter = Router();

// POST /api/payments/checkout - create Razorpay order
paymentRouter.post("/checkout", verifyJwt, checkout);

// POST /api/payments/verify - verify Razorpay signature and create Payment record
paymentRouter.post("/verify", verifyJwt, verify);

// GET /api/payments/my - get current user's orders
paymentRouter.get("/my", verifyJwt, userOrder);

// GET /api/payments - admin: list all orders
paymentRouter.get("/", verifyJwt, verifyAdmin, allOrders);

export default paymentRouter;


