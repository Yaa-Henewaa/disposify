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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllProducts = exports.getProduct = exports.deleteProduct = exports.updateProduct = exports.createProduct = void 0;
const db_1 = require("../utils/db");
const createProduct = (data) => __awaiter(void 0, void 0, void 0, function* () {
    const product = yield db_1.prisma.product.create({
        data: {
            name: data.name,
            description: data.description,
            price: data.price,
            stock: data.stock,
            userId: data.userId
        }
    });
    return product;
});
exports.createProduct = createProduct;
const updateProduct = (params) => __awaiter(void 0, void 0, void 0, function* () {
    const product = yield db_1.prisma.product.update({
        where: { id: params.id },
        data: {
            name: params.name,
            description: params.description,
            price: params.price,
            stock: params.stock
        }
    });
    return product;
});
exports.updateProduct = updateProduct;
const deleteProduct = (id) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield db_1.prisma.product.delete({
            where: { id }
        });
    }
    catch (error) {
        throw new Error('Error deleting product');
    }
});
exports.deleteProduct = deleteProduct;
const getProduct = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const product = yield db_1.prisma.product.findUnique({
        where: { id }
    });
    if (!product) {
        throw new Error('Product not found');
    }
    return product;
});
exports.getProduct = getProduct;
const getAllProducts = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const products = yield db_1.prisma.product.findMany();
        return products;
    }
    catch (error) {
        throw new Error('Error fetching products');
    }
});
exports.getAllProducts = getAllProducts;
