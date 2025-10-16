import { Router } from "express";
import verifyJwt from "../middleware/verifyJWT.js";
import { getAllCustomers, register, login, refresh, logout } from "../controllers/user.js";

const userRouter = Router();
// GET /api/users/customers (admin only)
userRouter.get("/customers", verifyJwt, getAllCustomers);
userRouter.post("/register", register);
userRouter.post("/login", login);
userRouter.get("/refresh", refresh);
userRouter.post("/logout", logout);

export default userRouter;