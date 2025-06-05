"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.webhookRoutes = void 0;
const express_1 = require("express");
const express_2 = __importDefault(require("express"));
const paystack_service_1 = require("../payment/paystack.service");
const router = (0, express_1.Router)();
exports.webhookRoutes = router;
router.post('/webhook', express_2.default.raw({ type: 'application/json' }), (req, res, next) => {
    Promise.resolve((0, paystack_service_1.paystackWebhook)(req, res)).catch(next);
});
