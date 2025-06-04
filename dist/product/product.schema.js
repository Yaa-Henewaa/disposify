"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductSchema = void 0;
const express_validator_1 = require("express-validator");
class ProductSchema {
    static create() {
        return [
            (0, express_validator_1.body)('name').notEmpty().withMessage('Name is required'),
            (0, express_validator_1.body)('price')
                .isFloat({ min: 0 })
                .withMessage('Price must be a positive number'),
            (0, express_validator_1.body)('stock')
                .isInt({ min: 0 })
                .withMessage('Stock must be a positive integer'),
            (0, express_validator_1.body)('description').optional().isString()
        ];
    }
    static update() {
        return [
            (0, express_validator_1.body)('name').optional().notEmpty().withMessage('Name cannot be empty'),
            (0, express_validator_1.body)('price')
                .optional()
                .isFloat({ min: 0 })
                .withMessage('Price must be a positive number'),
            (0, express_validator_1.body)('stock')
                .optional()
                .isInt({ min: 0 })
                .withMessage('Stock must be a positive integer'),
            (0, express_validator_1.body)('description').optional().isString()
        ];
    }
}
exports.ProductSchema = ProductSchema;
