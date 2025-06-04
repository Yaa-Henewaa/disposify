"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.refreshToken = exports.accessToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
/**
 * Generate a json web token for a user
 * @param id The id of the user
 */
const accessToken = (id) => {
    if (process.env.JWT_SECRET !== undefined) {
        return jsonwebtoken_1.default.sign({ id }, process.env.JWT_SECRET, {
            expiresIn: "15m",
        });
    }
};
exports.accessToken = accessToken;
const refreshToken = (id) => {
    if (process.env.JWT_REFRESH_SECRET !== undefined) {
        return jsonwebtoken_1.default.sign({ id }, process.env.JWT_REFRESH_SECRET, {
            expiresIn: "6d",
        });
    }
    return null;
};
exports.refreshToken = refreshToken;
