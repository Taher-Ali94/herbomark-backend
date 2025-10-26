import { Product } from "../database/models/Product.js";
import { logEvents } from "../middleware/logger.js";

// add product
export const addProduct = async (req, res) => {
    const { title, description, price, category, qty, imgSrc } = req.body;
    if (!title || (price === undefined || price === null)) {
        return res.status(400).json({ message: 'title and price are required' });
    }
    try {
        const product = await Product.create({ title, description, price, category, qty, imgSrc });
        return res.status(201).json({ message: 'Product added successfully...!', product });
    } catch (error) {
        logEvents(`${error.name}: ${error.message}\t${req.method}\t${req.url}\t${req.headers.origin}`, "errorLog.log");
        return res.status(500).json({ message: 'Failed to add product' });
    }
}

// get products
export const getProducts = async (req, res) => {
    try {
        const products = await Product.find().sort({ createdAt: -1 });
        return res.json({ message: 'All products', products });
    } catch (error) {
        logEvents(`${error.name}: ${error.message}\t${req.method}\t${req.url}\t${req.headers.origin}`, "errorLog.log");
        return res.status(500).json({ message: 'Failed to fetch products' });
    }
}


// find product by id
export const getProductById = async (req, res) => {
    const id = req.params.id;
    try {
        const product = await Product.findById(id);
        if (!product) return res.status(404).json({ message: 'Product not found' });
        return res.json({ message: "Specific product", product });
    } catch (error) {
        logEvents(`${error.name}: ${error.message}\t${req.method}\t${req.url}\t${req.headers.origin}`, "errorLog.log");
        return res.status(400).json({ message: 'Invalid product id' });
    }
};

// update product by id
export const updateProductById = async (req, res) => {
    const id = req.params.id;
    try {
        const product = await Product.findByIdAndUpdate(id, req.body, { new: true });
        if (!product) return res.status(404).json({ message: 'Product not found' });
        return res.json({ message: "Product has been updated", product });
    } catch (error) {
        logEvents(`${error.name}: ${error.message}\t${req.method}\t${req.url}\t${req.headers.origin}`, "errorLog.log");
        return res.status(400).json({ message: 'Invalid product id' });
    }
};

// delete product by id
export const deleteProductById = async (req, res) => {
    const id = req.params.id;
    try {
        const product = await Product.findByIdAndDelete(id);
        if (!product) return res.status(404).json({ message: 'Product not found' });
        return res.json({ message: "Product has been deleted", product });
    } catch (error) {
        logEvents(`${error.name}: ${error.message}\t${req.method}\t${req.url}\t${req.headers.origin}`, "errorLog.log");
        return res.status(400).json({ message: 'Invalid product id' });
    }
}; 