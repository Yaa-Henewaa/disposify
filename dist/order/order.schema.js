"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderSchema = void 0;
const express_validator_1 = require("express-validator");
class OrderSchema {
    static createOrder() {
        return [
            (0, express_validator_1.body)("items")
                .isArray({ min: 1 })
                .withMessage("At least one order item is required"),
            (0, express_validator_1.body)("items.*.productId")
                .isInt({ min: 1 })
                .withMessage("Product ID must be a positive integer"),
            (0, express_validator_1.body)("items.*.quantity")
                .isInt({ min: 1 })
                .withMessage("Quantity must be at least 1"),
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
