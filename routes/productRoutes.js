import { Router } from 'express';
import { addProduct, deleteProductById, getProductById, getProducts, updateProductById } from "../controllers/product.js";
import verifyJwt from '../middleware/verifyJWT.js';
import verifyAdmin from '../middleware/verifyAdmin.js';

const productRouter = Router();


// POST /api/products
productRouter.post('/', verifyJwt, verifyAdmin, addProduct);

// GET /api/products
productRouter.get('/',getProducts);

// GET /api/products/:id
productRouter.get('/:id', getProductById);

// PUT /api/products/:id
productRouter.put('/:id', verifyJwt, verifyAdmin, updateProductById);

// DELETE /api/products/:id
productRouter.delete('/:id', verifyJwt, verifyAdmin, deleteProductById);


export default productRouter;