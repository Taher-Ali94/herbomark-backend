import { Cart } from "../database/models/Cart.js";
import { logger, logEvents } from "../middleware/logger.js";

// add To Cart
export const addToCart = async (req, res) => {
    try {
        const { productId, title, price, qty, imgSrc } = req.body;

        // Validate required fields
        if (!productId || !title || !price || !qty) {
            return res.status(400).json({ 
                message: "Missing required fields: productId, title, price, qty" 
            });
        }

        const userId = req.user;

        let cart = await Cart.findOne({ userId });

        if (!cart) {
            cart = new Cart({ userId, items: [] });
        }

        const itemIndex = cart.items.findIndex(
            (item) => item.productId.toString() === productId
        );

        if (itemIndex > -1) {
            cart.items[itemIndex].qty += qty;
            cart.items[itemIndex].price += price * qty;
        } else {
            // store total price for the line item for consistency
            cart.items.push({ productId, title, price: price * qty, qty, imgSrc });
        }

        await cart.save();
        res.json({ message: "Items added to cart", cart });
    } catch (error) {
        logEvents(`${error.name}: ${error.message}\t${req.method}\t${req.url}\t${req.headers.origin}`, "errorLog.log");
        res.status(500).json({ message: "Internal server error" });
    }
};

// get User Cart
export const userCart = async (req, res) => {
    try {
        const userId = req.user;

        let cart = await Cart.findOne({ userId });
        if (!cart) return res.json({ message: "Cart not found" });

        res.json({ message: "User cart", cart });
    } catch (error) {
        logEvents(`${error.name}: ${error.message}\t${req.method}\t${req.url}\t${req.headers.origin}`, "errorLog.log");
        res.status(500).json({ message: "Internal server error" });
    }
};

// remove product from cart
export const removeProductFromCart = async (req, res) => {
    try {
        const productId = req.params.productId;
        const userId = req.user;

        if (!productId) {
            return res.status(400).json({ message: "Product ID is required" });
        }

        let cart = await Cart.findOne({ userId });
        if (!cart) return res.json({ message: "Cart not found" });

        cart.items = cart.items.filter((item) => item.productId.toString() !== productId);

        await cart.save();

        res.json({ message: "Product removed from cart" });
    } catch (error) {
        logEvents(`${error.name}: ${error.message}\t${req.method}\t${req.url}\t${req.headers.origin}`, "errorLog.log");
        res.status(500).json({ message: "Internal server error" });
    }
};


// clear cart
export const clearCart = async (req, res) => {
    try {
        const userId = req.user;

        let cart = await Cart.findOne({ userId });
        if (!cart) {
            cart = new Cart({ userId, items: [] });
        } else {
            cart.items = [];
        }

        await cart.save();

        res.json({ message: "Cart cleared" });
    } catch (error) {
        logEvents(`${error.name}: ${error.message}\t${req.method}\t${req.url}\t${req.headers.origin}`, "errorLog.log");
        res.status(500).json({ message: "Internal server error" });
    }
};


// decrease qty from cart
export const decreaseProudctQty = async (req, res) => {
    try {
        const { productId, qty } = req.body;

        // Validate required fields
        if (!productId || !qty) {
            return res.status(400).json({ 
                message: "Missing required fields: productId, qty" 
            });
        }

        const userId = req.user;

        let cart = await Cart.findOne({ userId });

        if (!cart) {
            cart = new Cart({ userId, items: [] });
        }

        const itemIndex = cart.items.findIndex(
            (item) => item.productId.toString() === productId
        );

        if (itemIndex > -1) {
            const item = cart.items[itemIndex];

            if (item.qty > qty) {
                const pricePerUnit = item.price / item.qty;

                item.qty -= qty;
                item.price -= pricePerUnit * qty;
            } else {
                cart.items.splice(itemIndex, 1);
            }

        } else {
            return res.json({ message: "Invalid product id" });
        }

        await cart.save();
        res.json({ message: "Item quantity decreased", cart });
    } catch (error) {
        logEvents(`${error.name}: ${error.message}\t${req.method}\t${req.url}\t${req.headers.origin}`, "errorLog.log");
        res.status(500).json({ message: "Internal server error" });
    }
};