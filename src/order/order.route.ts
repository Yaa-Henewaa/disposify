import { Router } from 'express';
import {protect}  from '../middleware/authMiddleware';
import {
  createOrderHandler,
  getOrderHandler,
  getUserOrdersHandler,
  cancelOrderHandler
} from './order.controller';

const router = Router();

router
  .route('/')
  .post(protect, createOrderHandler)
  .get(protect, getUserOrdersHandler);

router
  .route('/:id')
  .get(protect, getOrderHandler)
  .post(protect, cancelOrderHandler);



export { router as orderRoutes };