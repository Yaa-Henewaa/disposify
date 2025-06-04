"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserSchema = void 0;
const express_validator_1 = require("express-validator");
class UserSchema {
    static register() {
        return [
            (0, express_validator_1.body)('name').notEmpty().withMessage('Name is required'),
            (0, express_validator_1.body)('email').isEmail().withMessage('Invalid email address'),
            (0, express_validator_1.body)('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
            (0, express_validator_1.body)('confirmPassword')
                .isLength({ min: 6 })
                .withMessage('Confirm Password must be at least 6 characters long')
                .custom((value, { req }) => {
                if (value !== req.body.password) {
                    throw new Error('Passwords do not match');
                }
                return true;
            }),
            (0, express_validator_1.body)('isAdmin').optional().isBoolean()
        ];
    }
    static updateUser() {
        return [
            (0, express_validator_1.body)('name').optional().notEmpty().withMessage('Name is required'),
            (0, express_validator_1.body)('email').optional().isEmail().withMessage('Invalid email address'),
            (0, express_validator_1.body)('password').optional().isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
            (0, express_validator_1.body)('isAdmin').optional().isBoolean()
        ];
    }
    static login() {
        return [
            (0, express_validator_1.body)('email').isEmail().withMessage('Invalid email address'),
            (0, express_validator_1.body)('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
        ];
    }
    static verificationCode() {
        return [
            (0, express_validator_1.body)('verificationCode')
                .isLength({ min: 6, max: 6 })
                .withMessage('Verification code must be exactly 6 characters long')
        ];
    }
    static resetPassword() {
        return [
            (0, express_validator_1.body)('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
            (0, express_validator_1.body)('verificationCode')
                .isLength({ min: 6, max: 6 })
                .withMessage('Verification code must be exactly 6 characters long')
        ];
    }
    static forgotPassword() {
        return [
            (0, express_validator_1.body)('email').isEmail().withMessage('Invalid email address')
        ];
    }
}
exports.UserSchema = UserSchema;
