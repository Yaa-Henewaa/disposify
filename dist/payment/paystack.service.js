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
exports.paystackWebhook = exports.paystackService = void 0;
// services/paystackService.ts
const paystack_1 = require("../config/paystack");
const appError_1 = require("../middleware/appError");
const crypto_1 = __importDefault(require("crypto"));
const order_service_1 = require("../order/order.service");
exports.paystackService = {
    initializePayment(params) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            try {
                const amountInKobo = Math.round(params.amount * 100);
                const payload = {
                    email: params.email,
                    amount: amountInKobo,
                    reference: params.reference ||
                        `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                    callback_url: params.callback_url || process.env.PAYSTACK_CALLBACK_URL,
                    metadata: params.metadata || {},
                    channels: params.channels || [
                        "card",
                        "bank",
                        "ussd",
                        "qr",
                        "mobile_money",
                        "bank_transfer",
                    ],
                };
                const response = yield paystack_1.paystackApi.post("/transaction/initialize", payload);
                if (!response.data.status) {
                    throw new appError_1.AppError(400, response.data.message || "Payment initialization failed");
                }
                return {
                    success: true,
                    authorization_url: response.data.data.authorization_url,
                    reference: response.data.data.reference,
                    access_code: response.data.data.access_code,
                };
            }
            catch (error) {
                console.error("Paystack initialization error:", error);
                if (error instanceof appError_1.AppError) {
                    throw error;
                }
                if ((_b = (_a = error.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.message) {
                    throw new appError_1.AppError(400, error.response.data.message);
                }
                throw new appError_1.AppError(500, "Payment initialization failed. Please try again.");
            }
        });
    },
    verifyPayment(params) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            try {
                const response = yield paystack_1.paystackApi.get(`/transaction/verify/${params.reference}`);
                if (!response.data.status) {
                    return {
                        success: false,
                        error: response.data.message || "Payment verification failed",
                    };
                }
                const { data } = response.data;
                if (data.status === "success") {
                    return {
                        success: true,
                        data: {
                            id: data.id,
                            reference: data.reference,
                            amount: data.amount / 100, // Convert back to main currency unit
                            currency: data.currency,
                            status: data.status,
                            paid_at: data.paid_at,
                            customer: data.customer,
                            authorization: data.authorization,
                            metadata: data.metadata,
                            gateway_response: data.gateway_response,
                        },
                    };
                }
                return {
                    success: false,
                    error: `Payment ${data.status}. ${data.gateway_response || ""}`,
                };
            }
            catch (error) {
                console.error("Paystack verification error:", error);
                if ((_b = (_a = error.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.message) {
                    throw new appError_1.AppError(400, error.response.data.message);
                }
                throw new appError_1.AppError(500, "Payment verification failed. Please try again.");
            }
        });
    },
    getAllTransactions() {
        return __awaiter(this, arguments, void 0, function* (page = 1, perPage = 50) {
            try {
                const response = yield paystack_1.paystackApi.get("/transaction", {
                    params: { page, perPage },
                });
                if (!response.data.status) {
                    throw new appError_1.AppError(400, response.data.message || "Failed to fetch transactions");
                }
                return {
                    success: true,
                    data: response.data.data,
                    meta: response.data.meta,
                };
            }
            catch (error) {
                console.error("Paystack fetch transactions error:", error);
                throw new appError_1.AppError(500, "Failed to fetch transactions");
            }
        });
    },
    createCustomer(customerData) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield paystack_1.paystackApi.post("/customer", customerData);
                if (!response.data.status) {
                    throw new appError_1.AppError(400, response.data.message || "Customer creation failed");
                }
                return {
                    success: true,
                    data: response.data.data,
                };
            }
            catch (error) {
                console.error("Paystack customer creation error:", error);
                throw new appError_1.AppError(500, "Customer creation failed");
            }
        });
    },
};
const paystackWebhook = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Verify webhook signature
        const hash = crypto_1.default
            .createHmac("sha512", process.env.PAYSTACK_SECRET_KEY)
            .update(JSON.stringify(req.body))
            .digest("hex");
        if (hash !== req.headers["x-paystack-signature"]) {
            return res.status(400).send("Invalid signature");
        }
        const event = req.body;
        // Handle successful payments
        if (event.event === "charge.success") {
            const { reference, metadata, amount } = event.data;
            // First verify the payment
            const verificationResult = yield exports.paystackService.verifyPayment({
                reference,
            });
            if (!verificationResult.success) {
                console.error("Payment verification failed:", verificationResult.error);
                return res.sendStatus(400);
            }
            // Validate metadata
            if (!(metadata === null || metadata === void 0 ? void 0 : metadata.userId) || !(metadata === null || metadata === void 0 ? void 0 : metadata.items)) {
                console.error("Invalid metadata in webhook:", metadata);
                return res.sendStatus(400);
            }
            // Verify the items format
            const items = metadata.items.map((item) => ({
                productId: item.productId,
                quantity: parseInt(item.quantity, 10),
            }));
            // Create order using existing service
            const orderResult = yield (0, order_service_1.createOrder)({
                userId: metadata.userId,
                items: items,
                transactionId: reference,
            });
            if (!orderResult.success) {
                console.error("Order creation failed:", orderResult.error);
                return res.sendStatus(400);
            }
            // Log successful order creation
            console.log(`Order created successfully for payment reference: ${reference}`);
        }
        res.sendStatus(200);
    }
    catch (error) {
        console.error("Webhook error:", error);
        if (error instanceof Error) {
            console.error(error.message);
        }
        res.sendStatus(500);
    }
});
exports.paystackWebhook = paystackWebhook;
