import { Router } from "express";
import verifyJwt from "../middleware/verifyJWT.js";
import { getAllCustomers } from "../controllers/user.js";
import { register } from "../controllers/user.js";
import { login } from "../controllers/user.js";
import { refresh } from "../controllers/user.js";
import { logout } from "../controllers/user.js";

const userRouter = Router();
userRouter.get("/all-customers", verifyJwt, getAllCustomers);
userRouter.post("/register", register);
userRouter.post("/login", login);
userRouter.get("/refresh", refresh);
userRouter.post("/logout", logout);

export default userRouter;