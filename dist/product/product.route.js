"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.productRoutes = void 0;
const express_1 = require("express");
const authMiddleware_1 = require("../middleware/authMiddleware");
const product_controller_1 = require("./product.controller");
const router = (0, express_1.Router)();
exports.productRoutes = router;
router
    .route('/')
    .post(authMiddleware_1.protect, product_controller_1.createProductHandler)
    .get(product_controller_1.getAllProductsHandler);
router
    .route('/:id')
    .get(product_controller_1.getProductHandler)
    .put(authMiddleware_1.protect, authMiddleware_1.admin, product_controller_1.updateProductHandler)
    .delete(authMiddleware_1.protect, authMiddleware_1.admin, product_controller_1.deleteProductHandler);
