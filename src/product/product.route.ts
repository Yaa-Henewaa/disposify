import { Router } from 'express';
import {protect,admin}  from '../middleware/authMiddleware';
import {
  createProductHandler,
  updateProductHandler,
  deleteProductHandler,
  getProductHandler,
  getAllProductsHandler
} from './product.controller';

const router = Router();

router
  .route('/')
  .post(protect, createProductHandler)
  .get(getAllProductsHandler);

router
  .route('/:id')
  .get(getProductHandler)
  .put(protect, admin, updateProductHandler)
  .delete(protect, admin, deleteProductHandler);

export { router as productRoutes };