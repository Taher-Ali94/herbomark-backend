import { Router } from 'express'
import { addProduct, deleteProductById, getProductById, getProducts, updateProductById } from "../controllers/product.js";
import verifyJwt from '../middleware/verifyJWT.js';
import verifyAdmin from '../middleware/verifyAdmin.js';

const productRouter = Router();
productRouter.use(verifyJwt)
productRouter.use(verifyAdmin)

// POST /api/products
productRouter.post('/', addProduct)

// GET /api/products
productRouter.get('/', getProducts)

// GET /api/products/:id
productRouter.get('/:id', getProductById)

// PUT /api/products/:id
productRouter.put('/:id', updateProductById)

// DELETE /api/products/:id
productRouter.delete('/:id', deleteProductById)


export default productRouter