"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.orderRoutes = void 0;
const express_1 = require("express");
const authMiddleware_1 = require("../middleware/authMiddleware");
const order_controller_1 = require("./order.controller");
const router = (0, express_1.Router)();
exports.orderRoutes = router;
router
    .route('/')
    .post(authMiddleware_1.protect, order_controller_1.createOrderHandler)
    .get(authMiddleware_1.protect, order_controller_1.getUserOrdersHandler);
router
    .route('/:id')
    .get(authMiddleware_1.protect, order_controller_1.getOrderHandler)
    .post(authMiddleware_1.protect, order_controller_1.cancelOrderHandler);
router
    .route('/:orderId/payment')
    .post(authMiddleware_1.protect, order_controller_1.processPaymentHandler);
