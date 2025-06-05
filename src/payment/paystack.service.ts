// services/paystackService.ts
import { paystackApi } from "../config/paystack";
import { AppError } from "../middleware/appError";
import { Request, Response } from "express";
import crypto from "crypto";
import { prisma } from "../utils/db";
import { OrderStatus, PaymentStatus } from "@prisma/client";
import { createOrder } from "../order/order.service";

interface PaystackCustomer {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  customer_code: string;
  phone: string;
  metadata: Record<string, any>;
}

interface PaystackAuthorization {
  authorization_code: string;
  bin: string;
  last4: string;
  exp_month: string;
  exp_year: string;
  channel: string;
  card_type: string;
  bank: string;
  country_code: string;
  brand: string;
  reusable: boolean;
}

interface PaystackTransactionData {
  id: number;
  domain: string;
  status: "success" | "failed" | "abandoned";
  reference: string;
  amount: number;
  message: string;
  gateway_response: string;
  paid_at: string;
  created_at: string;
  channel: string;
  currency: string;
  ip_address: string;
  metadata: Record<string, any>;
  fees: number;
  customer: PaystackCustomer;
  authorization: PaystackAuthorization;
}

interface PaystackResponse<T = any> {
  status: boolean;
  message: string;
  data: T;
  meta?: {
    total: number;
    skipped: number;
    perPage: number;
    page: number;
    pageCount: number;
  };
}

interface InitializePaymentParams {
  email: string;
  amount: number;
  reference?: string;
  callback_url?: string;
  metadata?: Record<string, any>;
  channels?: string[];
}

interface VerifyPaymentParams {
  reference: string;
}

interface PaystackInitializeData {
  authorization_url: string;
  access_code: string;
  reference: string;
}

export const paystackService = {
  async initializePayment(params: InitializePaymentParams) {
    try {
      const amountInKobo = Math.round(params.amount * 100);

      const payload = {
        email: params.email,
        amount: amountInKobo,
        reference:
          params.reference ||
          `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        callback_url: params.callback_url || process.env.PAYSTACK_CALLBACK_URL,
        metadata: params.metadata || {},
        channels: params.channels || [
          "card",
          "bank",
          "ussd",
          "qr",
          "mobile_money",
          "bank_transfer",
        ],
      };

      const response = await paystackApi.post<
        PaystackResponse<PaystackInitializeData>
      >("/transaction/initialize", payload);

      if (!response.data.status) {
        throw new AppError(
          400,
          response.data.message || "Payment initialization failed"
        );
      }

      return {
        success: true,
        authorization_url: response.data.data.authorization_url,
        reference: response.data.data.reference,
        access_code: response.data.data.access_code,
      };
    } catch (error: any) {
      console.error("Paystack initialization error:", error);

      if (error instanceof AppError) {
        throw error;
      }

      if (error.response?.data?.message) {
        throw new AppError(400, error.response.data.message);
      }

      throw new AppError(
        500,
        "Payment initialization failed. Please try again."
      );
    }
  },

  async verifyPayment(params: VerifyPaymentParams) {
    try {
      const response = await paystackApi.get<
        PaystackResponse<PaystackTransactionData>
      >(`/transaction/verify/${params.reference}`);

      if (!response.data.status) {
        return {
          success: false,
          error: response.data.message || "Payment verification failed",
        };
      }

      const { data } = response.data;

      if (data.status === "success") {
        return {
          success: true,
          data: {
            id: data.id,
            reference: data.reference,
            amount: data.amount / 100, // Convert back to main currency unit
            currency: data.currency,
            status: data.status,
            paid_at: data.paid_at,
            customer: data.customer,
            authorization: data.authorization,
            metadata: data.metadata,
            gateway_response: data.gateway_response,
          },
        };
      }

      return {
        success: false,
        error: `Payment ${data.status}. ${data.gateway_response || ""}`,
      };
    } catch (error: any) {
      console.error("Paystack verification error:", error);

      if (error.response?.data?.message) {
        throw new AppError(400, error.response.data.message);
      }

      throw new AppError(500, "Payment verification failed. Please try again.");
    }
  },

  async getAllTransactions(page: number = 1, perPage: number = 50) {
    try {
      const response = await paystackApi.get<
        PaystackResponse<PaystackTransactionData[]>
      >("/transaction", {
        params: { page, perPage },
      });

      if (!response.data.status) {
        throw new AppError(
          400,
          response.data.message || "Failed to fetch transactions"
        );
      }

      return {
        success: true,
        data: response.data.data,
        meta: response.data.meta,
      };
    } catch (error: any) {
      console.error("Paystack fetch transactions error:", error);
      throw new AppError(500, "Failed to fetch transactions");
    }
  },

  async createCustomer(customerData: {
    email: string;
    first_name: string;
    last_name: string;
    phone?: string;
    metadata?: Record<string, any>;
  }) {
    try {
      const response = await paystackApi.post<
        PaystackResponse<PaystackCustomer>
      >("/customer", customerData);

      if (!response.data.status) {
        throw new AppError(
          400,
          response.data.message || "Customer creation failed"
        );
      }

      return {
        success: true,
        data: response.data.data,
      };
    } catch (error: any) {
      console.error("Paystack customer creation error:", error);
      throw new AppError(500, "Customer creation failed");
    }
  },
};

export const paystackWebhook = async (req: Request, res: Response) => {
  try {
     console.log('Webhook Headers:', req.headers);
    console.log('Webhook Body:', req.body);
    // 1. Validate request body exists
    if (!req.body) {
      console.error('Empty webhook body received');
      return res.status(400).send('Empty request body');
    }

    // 2. Verify webhook signature
    const signature = req.headers['x-paystack-signature'];
    if (!signature || typeof signature !== 'string') {
      console.error('Missing Paystack signature header');
      return res.status(400).send('Invalid signature');
    }

    // Convert body to string safely
    const bodyString = typeof req.body === 'string' 
      ? req.body 
      : JSON.stringify(req.body);

    const hash = crypto
      .createHmac('sha512', process.env.PAYSTACK_SECRET_KEY!)
      .update(bodyString)
      .digest('hex');

    if (hash !== signature) {
      console.error('Invalid Paystack signature');
      return res.status(400).send('Invalid signature');
    }

    const event = req.body.event;
    const data = req.body.data;

    if (event !== 'charge.success') {
      return res.status(200).send('Event not processed');
    }

    // 4. Verify payment
    const verification = await paystackService.verifyPayment({
      reference: data.reference
    });

    if (!verification.success) {
      console.error('Payment verification failed:', verification.error);
      return res.status(400).send('Payment verification failed');
    }

      // Validate metadata
      if (!data.metadata?.userId || !data.metadata?.items) {
        console.error("Invalid metadata in webhook:", data.metadata);
        return res.sendStatus(400);
      }

      // Verify the items format
      const items = data.metadata.items.map((item: { productId: string; quantity: string; }) => ({
        productId: item.productId,
        quantity: parseInt(item.quantity, 10), 
      }));

      // Create order using existing service
      const orderResult = await createOrder({
        userId: data.metadata.userId,
        items: items,
        transactionId: data.reference,
       
      });

      if (!orderResult.success) {
        console.error("Order creation failed:", orderResult.error);
        return res.sendStatus(400);
      }

      // Log successful order creation
      console.log(
        `Order created successfully for payment reference: ${data.reference}`
      );
  

    res.sendStatus(200).send("Webhook processed successfully");
  } catch (error) {
    console.error("Webhook error:", error);
    if (error instanceof Error) {
      console.error(error.message);
    }
    res.sendStatus(500);
  }
};

