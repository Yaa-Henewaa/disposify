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
exports.getAllProductsHandler = exports.getProductHandler = exports.deleteProductHandler = exports.updateProductHandler = exports.createProductHandler = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const express_validator_1 = require("express-validator");
const product_schema_1 = require("./product.schema");
const product_service_1 = require("./product.service");
exports.createProductHandler = [
    ...product_schema_1.ProductSchema.create(),
    (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            res.status(400);
            throw new Error(JSON.stringify({ errors: errors.array() }));
        }
        const { body, user } = req;
        const { id } = user;
        const product = yield (0, product_service_1.createProduct)(Object.assign(Object.assign({}, body), { userId: id }));
        res.status(201).json(product);
    }))
];
exports.updateProductHandler = [
    ...product_schema_1.ProductSchema.update(),
    (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            res.status(400);
            throw new Error(JSON.stringify({ errors: errors.array() }));
        }
        const product = yield (0, product_service_1.updateProduct)(Object.assign({ id: req.params.id }, req.body));
        res.json(product);
    }))
];
exports.deleteProductHandler = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, product_service_1.deleteProduct)(req.params.id);
    res.status(204).send();
}));
exports.getProductHandler = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const product = yield (0, product_service_1.getProduct)(req.params.id);
    if (!product) {
        res.status(404);
        throw new Error('Product not found');
    }
    res.json(product);
}));
exports.getAllProductsHandler = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const products = yield (0, product_service_1.getAllProducts)();
    res.json(products);
}));
