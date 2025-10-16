import { Router } from 'express';
import {
    addToCart,
    clearCart,
    removeProductFromCart,
    userCart,
    decreaseProudctQty,
} from "../controllers/cart.js";
import verifyJwt from "../middleware/verifyJWT.js";



const cartRouter = Router();
cartRouter.use(verifyJwt);

// add To cart
cartRouter.post('/add', addToCart);

// get User Cart
cartRouter.get("/user", userCart);

// remove product from cart
cartRouter.delete("/remove/:productId", removeProductFromCart);

// clear cart
cartRouter.delete("/clear", clearCart);

// decrease items qty
cartRouter.post("/--qty", decreaseProudctQty);


export default cartRouter;