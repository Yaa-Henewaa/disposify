import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { validationResult } from "express-validator";
import { OrderSchema } from "./order.schema";
import { User } from "@prisma/client";
import { AppError } from "../middleware/appError";
import {
  createOrder,
  processPayment,
  getOrder,
  getUserOrders,
  cancelOrder,
  calculateOrderTotal,
} from "./order.service";

export const createOrderHandler = [
  ...OrderSchema.createOrder(),
  asyncHandler(async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new AppError(400, "Validation Error", errors.array());
    }

    const { body, user } = req;
    const { id: userId ,email} = user!;

    try {
      const totalAmount = await calculateOrderTotal(body.items);

      const paymentResult = await processPayment({
        amount: totalAmount,
        email,
        metadata: {
          userId,
          items: body.items,
        },
      });
      if (!paymentResult.success) {
        res
          .status(400)
          .json({ error: paymentResult.error || "Payment processing failed" ,});
        return;
      }

      if (paymentResult.authorization_url) {
        // Redirect to payment gateway 
        res.status(200).json({
          authorization_url: paymentResult.authorization_url,
          message: "Redirect to payment gateway",
        });
        return;
        
      }


    } catch (error) {
      res.status(400).json({
        error: error instanceof Error ? error.message : "Order creation failed",
      });
    }
  }),
]

export const getOrderHandler = asyncHandler(
  async (req: Request, res: Response) => {
    const { params, user } = req;
    const { id } = params;
    const { id: userId } = user!;

    const order = await getOrder(id);

    if (!order) {
      throw new AppError(404, "Order not found");
    }

    if (order.userId !== userId) {
      throw new AppError(
        403,
        "Forbidden: You do not have permission to view this order"
      );
    }

    res.json(order);
  }
);

export const getUserOrdersHandler = asyncHandler(
  async (req: Request, res: Response) => {
    const { id: userId } = req.user!;
    const orders = await getUserOrders(userId);
    res.json(orders);
  }
);

export const cancelOrderHandler = [
  ...OrderSchema.cancelOrder(),
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    const order = await getOrder(id);
    if (!order) {
      throw new AppError(404, "Order not found");
    }

    if (order.userId !== req.user!.id) {
      throw new AppError(403, "Forbidden: You cannot cancel this order");
    }

    const result = await cancelOrder(id);

    if (!result.success) {
      throw new AppError(400, result.error || "Failed to cancel order");
    }

    res.json({ message: "Order cancelled successfully", order: result.order });
  }),
];
