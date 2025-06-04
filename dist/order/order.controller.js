"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cancelOrderHandler = exports.getUserOrdersHandler = exports.getOrderHandler = exports.processPaymentHandler = exports.createOrderHandler = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const express_validator_1 = require("express-validator");
const order_schema_1 = require("./order.schema");
const appError_1 = require("../middleware/appError");
const order_service_1 = require("./order.service");
exports.createOrderHandler = [
    ...order_schema_1.OrderSchema.createOrder(),
    (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            throw new appError_1.AppError(400, 'Validation Error', errors.array());
        }
        const { body, user } = req;
        const { id: userId } = user;
        const result = yield (0, order_service_1.createOrder)({
            userId,
            items: body.items
        });
        if (!result.success) {
            throw new appError_1.AppError(400, result.error || 'Failed to create order');
        }
        res.status(201).json(result.order);
    }))
];
exports.processPaymentHandler = [
    ...order_schema_1.OrderSchema.processPayment(),
    (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            throw new appError_1.AppError(400, 'Validation Error', errors.array());
        }
        const { params, body } = req;
        const { orderId } = params;
        const { amount } = body;
        const result = yield (0, order_service_1.processPayment)({ orderId, amount });
        if (!result.success) {
            throw new appError_1.AppError(400, result.error || 'Payment processing failed');
        }
        res.json({
            message: 'Payment processed successfully',
            transactionId: result.transactionId
        });
    }))
];
exports.getOrderHandler = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { params, user } = req;
    const { id } = params;
    const { id: userId } = user;
    const order = yield (0, order_service_1.getOrder)(id);
    if (!order) {
        throw new appError_1.AppError(404, 'Order not found');
    }
    if (order.userId !== userId) {
        throw new appError_1.AppError(403, 'Forbidden: You do not have permission to view this order');
    }
    res.json(order);
}));
exports.getUserOrdersHandler = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id: userId } = req.user;
    const orders = yield (0, order_service_1.getUserOrders)(userId);
    res.json(orders);
}));
exports.cancelOrderHandler = [
    ...order_schema_1.OrderSchema.cancelOrder(),
    (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { id } = req.params;
        const order = yield (0, order_service_1.getOrder)(id);
        if (!order) {
            throw new appError_1.AppError(404, 'Order not found');
        }
        if (order.userId !== req.user.id) {
            throw new appError_1.AppError(403, 'Forbidden: You cannot cancel this order');
        }
        const result = yield (0, order_service_1.cancelOrder)(id);
        if (!result.success) {
            throw new appError_1.AppError(400, result.error || 'Failed to cancel order');
        }
        res.json({ message: 'Order cancelled successfully', order: result.order });
    }))
];
