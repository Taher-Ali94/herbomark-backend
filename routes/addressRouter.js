import { Router } from "express";
import verifyJwt from "../middleware/verifyJWT.js";
import { addAddress, getAddress } from "../controllers/address.js";

const addressRouter = Router();
addressRouter.use(verifyJwt);

// add address
addressRouter.post("/add", addAddress);

// get latest address for user
addressRouter.get("/user", getAddress);

export default addressRouter;


