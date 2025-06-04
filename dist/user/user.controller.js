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
exports.verifyEmailHandler = exports.registerHandler = exports.loginHandler = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const express_validator_1 = require("express-validator");
const generateToken_1 = require("../utils/generateToken");
const user_schema_1 = require("./user.schema");
const user_service_1 = require("./user.service");
exports.loginHandler = [
    ...user_schema_1.UserSchema.login(),
    (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            res.status(400);
            throw new Error(JSON.stringify({ errors: errors.array() }));
        }
        const { email, password } = req.body;
        try {
            const { user } = yield (0, user_service_1.loginUser)({ email, password });
            res.json({
                id: user.id,
                name: user.name,
                email: user.email,
                isAdmin: user.isAdmin,
                accessToken: (0, generateToken_1.accessToken)(user.id),
                refreshToken: (0, generateToken_1.refreshToken)(user.id),
            });
        }
        catch (error) {
            if (error instanceof Error) {
                res.status(401).json({ message: error.message });
            }
            else {
                res.status(401).json({ message: 'Login failed' });
            }
        }
    }))
];
exports.registerHandler = [
    ...user_schema_1.UserSchema.register(),
    (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            res.status(400);
            throw new Error(JSON.stringify({ errors: errors.array() }));
        }
        const { name, email, password } = req.body;
        try {
            const { user } = yield (0, user_service_1.createUser)({
                name,
                email,
                password,
            });
            res.status(201).json({
                id: user.id,
                name: user.name,
                email: user.email,
                isAdmin: user.isAdmin,
                accessToken: (0, generateToken_1.accessToken)(user.id),
                refreshToken: (0, generateToken_1.refreshToken)(user.id)
            });
        }
        catch (error) {
            if (error instanceof Error) {
                const status = error.message.includes('already exists') ? 409 : 400;
                res.status(status).json({ message: error.message });
            }
            else {
                res.status(400).json({ message: 'Registration failed' });
            }
        }
    }))
];
exports.verifyEmailHandler = [(0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { verificationCode } = req.body;
        if (!verificationCode) {
            res.status(400).json({ message: 'Verification code is required' });
            return;
        }
        try {
            yield (0, user_service_1.verifyEmail)(verificationCode);
            res.json({ message: 'Email verified successfully' });
        }
        catch (error) {
            if (error instanceof Error) {
                res.status(400).json({ message: error.message });
            }
            else {
                res.status(400).json({ message: 'Email verification failed' });
            }
        }
    }))];
