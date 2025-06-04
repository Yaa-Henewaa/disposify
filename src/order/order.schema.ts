import { body, param, ValidationChain } from "express-validator";

export class OrderSchema {
  static createOrder(): ValidationChain[] {
    return [
    body('items')
      .isArray()
      .withMessage('Items must be an array')
      .notEmpty()
      .withMessage('Order must contain at least one item'),
    body('items.*.productId')
      .isString()
      .withMessage('Product ID must be a string')
      .matches(/^[0-9a-fA-F-]{36}$/)  
      .withMessage('Invalid product ID format'),
    body('items.*.quantity')
      .isInt({ min: 1 })
      .withMessage('Quantity must be a positive integer'),

    ];
  }

  static processPayment(): ValidationChain[] {
    return [
      param("orderId")
        .isInt({ min: 1 })
        .withMessage("Order ID must be a positive integer"),
      body("paymentMethod")
        .notEmpty()
        .withMessage("Payment method is required"),
      body("amount")
        .isFloat({ min: 0.01 })
        .withMessage("Amount must be a positive number"),
    ];
  }

  static cancelOrder(): ValidationChain[] {
    return [
   param('id')
      .isString()
      .withMessage('Order ID must be a string')
      .notEmpty()
      .withMessage('Order ID is required'),
    ];
  }
}
