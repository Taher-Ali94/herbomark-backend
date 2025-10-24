import { Router } from "express";
import verifyJwt from "../middleware/verifyJWT.js";
import { addAddress, getAddress,getAllAddresses,updateAddress,deleteAddress } from "../controllers/address.js";

const addressRouter = Router();

// All routes require authentication
addressRouter.use(verifyJwt);

// Create address
addressRouter.post('/add', addAddress);

// Get latest address (single, most recent)
addressRouter.get('/user', getAddress);

// Get all addresses for user
addressRouter.get('/all', getAllAddresses);

// Update address
addressRouter.put('/:id', updateAddress);

// Delete address
addressRouter.delete('/:id', deleteAddress);

export default addressRouter;


