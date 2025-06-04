import { OrderStatus, PaymentStatus } from "@prisma/client";
import { prisma } from "../utils/db";
import {
  CreateOrderParams,
  OrderWithItems,
  OrderResult,
 
 
} from "./order.entities";

import { ProcessPaymentParams, PaymentResult } from "./payment.entities";
import { paystackService } from "../payment/paystack.service";
import { AppError } from "../middleware/appError";

export const calculateOrderTotal = async (
  items: Array<{ productId: string; quantity: number }>
) => {
  let total = 0;

  for (const item of items) {
    const product = await prisma.product.findUnique({
      where: { id: item.productId },
      select: { price: true, stock: true },
    });

    if (!product) throw new Error(`Product ${item.productId} not found`);
    if (product.stock < item.quantity) throw new Error(`Insufficient stock`);

    total += (product.price*100) * item.quantity ;
  }

  return total;
};

export const createOrder = async (
  params: CreateOrderParams
): Promise<OrderResult> => {
  try {
    return await prisma.$transaction(async (tx) => {
      // Verifying products and calculate total

      const orderItems: {
        productId: string;
        quantity: number;
        priceAtOrder: number;
      }[] = [];
      //verifying products and build order items
      for (const item of params.items) {
        const product = await tx.product.findUnique({
          where: { id: item.productId },
        });

        if (!product) {
          throw new Error(`Product ${item.productId} not found`);
        }

        if (product.stock < item.quantity) {
          throw new Error(`Insufficient stock for ${product.name}`);
        }

        orderItems.push({
          productId: item.productId,
          quantity: item.quantity,
          priceAtOrder: product.price,
        });
      }
      //Creatin the order
      const totalAmount = await calculateOrderTotal(params.items);
      const order = await tx.order.create({
        data: {
          userId: params.userId,
          totalAmount: totalAmount,
          status: OrderStatus.PENDING,
          paymentStatus: PaymentStatus.PENDING,
          paymentGatewayTransactionId: params.transactionId,
          items: {
            create: orderItems,
          },
        },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      });

      //Updating product stocks
      for (const item of params.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        });
      }

      return {
        success: true,
        order,
        paymentGatewayTransactionId: order.paymentGatewayTransactionId,
      };
    });
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create order",
    };
  }
};



export const processPayment = async (params: ProcessPaymentParams): Promise<PaymentResult> => {
  try {
    const paymentResult = await paystackService.initializePayment({
      email: params.email,
      amount: params.amount,
      metadata: params.metadata,
      reference: `PAY_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
    });

    if (!paymentResult.success) {
      return {
        success: false,
        error: 'Payment initialization failed'
      };
    }

    return {
      success: true,
      transactionId: paymentResult.reference,
      authorization_url: paymentResult.authorization_url
    };
  } catch (error) {
    console.error('Payment processing error:', error);
    
    if (error instanceof AppError) {
      return {
        success: false,
        error: error.message
      };
    }

    return {
      success: false,
      error: 'Payment processing failed. Please try again.'
    };
  }
};

export const getOrder = async (id: string): Promise<OrderWithItems | null> => {
  try {
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    return order;
  } catch (error) {
    console.error("Error fetching order:", error);
    throw new Error("Error fetching order");
  }
};

export const getUserOrders = async (
  userId: string
): Promise<OrderWithItems[]> => {
  try {
    const orders = await prisma.order.findMany({
      where: { userId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return orders;
  } catch (error) {
    console.error("Error fetching user orders:", error);
    throw new Error("Error fetching user orders");
  }
};

export const cancelOrder = async (id: string): Promise<OrderResult> => {
  try {
    const existingOrder = await prisma.order.findUnique({
      where: { id },
      select: { status: true, paymentStatus: true },
    });

    if (!existingOrder) {
      return {
        success: false,
        error: "Order not found",
      };
    }

    if (existingOrder.status === OrderStatus.CANCELLED) {
      return {
        success: false,
        error: "Order is already cancelled",
      };
    }

    if (existingOrder.status === "COMPLETED") {
      return {
        success: false,
        error: "Cannot cancel completed order",
      };
    }

    // Cancel the order and restore stock
    const result = await prisma.$transaction(async (tx) => {
      const cancelledOrder = await tx.order.update({
        where: { id },
        data: {
          status: OrderStatus.CANCELLED,
        },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      });

      // Restore stock for cancelled order
      for (const item of cancelledOrder.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              increment: item.quantity,
            },
          },
        });
      }

      return cancelledOrder;
    });

    return {
      success: true,
      order: result,
    };
  } catch (error) {
    console.error("Error cancelling order:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error cancelling order",
    };
  }
};
