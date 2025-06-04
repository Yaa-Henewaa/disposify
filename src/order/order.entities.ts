import { Order, OrderItem, OrderStatus, PaymentStatus, Product, Prisma } from '@prisma/client';

export type OrderWithItems = Prisma.OrderGetPayload<{
  include: {
    items: {
      include: {
        product: true;
      };
    };
  };
}>;
export interface CreateOrderParams {
  userId: string;
  items: Array<{
    productId: string;
    quantity: number;
  }>;
  transactionId?: string; 
}

export interface ProcessPaymentParams {
  orderId?: string;
  amount: number;
}

export interface OrderResult {
  success: boolean;
  order?: OrderWithItems;
  error?: string;
}
