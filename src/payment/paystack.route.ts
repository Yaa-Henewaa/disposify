import { Router } from 'express';
import express from 'express'
import { paystackWebhook } from '../payment/paystack.service';

const router = Router();

router.post(
  '/paystack',
  express.raw({ type: 'application/json' }),
  (req, res, next) => {
	Promise.resolve(paystackWebhook(req, res)).catch(next);
  }
);

export { router as webhookRoutes };