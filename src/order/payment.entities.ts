export interface PaymentResult {
  success: boolean;
  transactionId?: string;
  authorization_url?: string;
  error?: string;
}

export interface ProcessPaymentParams {
  email: string;
  amount: number;
  metadata?: {
    orderId?: string;
    userId?: string;
    items?: Array<{
      productId: string;
      quantity: number;
    }>;
  };
}
