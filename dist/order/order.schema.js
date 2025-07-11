"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderSchema = void 0;
const express_validator_1 = require("express-validator");
class OrderSchema {
    static createOrder() {
        return [
            (0, express_validator_1.body)('items')
                .isArray()
                .withMessage('Items must be an array')
                .notEmpty()
                .withMessage('Order must contain at least one item'),
            (0, express_validator_1.body)('items.*.productId')
                .isString()
                .withMessage('Product ID must be a string')
                .matches(/^[0-9a-fA-F-]{36}$/)
                .withMessage('Invalid product ID format'),
            (0, express_validator_1.body)('items.*.quantity')
                .isInt({ min: 1 })
                .withMessage('Quantity must be a positive integer'),
        ];
    }
    static processPayment() {
        return [
            (0, express_validator_1.param)("orderId")
                .isInt({ min: 1 })
                .withMessage("Order ID must be a positive integer"),
            (0, express_validator_1.body)("paymentMethod")
                .notEmpty()
                .withMessage("Payment method is required"),
            (0, express_validator_1.body)("amount")
                .isFloat({ min: 0.01 })
                .withMessage("Amount must be a positive number"),
        ];
    }
    static cancelOrder() {
        return [
            (0, express_validator_1.param)('id')
                .isString()
                .withMessage('Order ID must be a string')
                .notEmpty()
                .withMessage('Order ID is required'),
        ];
    }
}
exports.OrderSchema = OrderSchema;
