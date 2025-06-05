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
exports.prisma = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const morgan_1 = __importDefault(require("morgan"));
const dotenv_1 = __importDefault(require("dotenv"));
const user_route_1 = require("./user/user.route");
const product_route_1 = require("./product/product.route");
const errorMiddleware_1 = require("./middleware/errorMiddleware");
const client_1 = require("@prisma/client");
const order_route_1 = require("./order/order.route");
const paystack_route_1 = require("./payment/paystack.route");
exports.prisma = new client_1.PrismaClient();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        app.use((0, cors_1.default)());
        app.use(express_1.default.json());
        app.use((0, morgan_1.default)("dev"));
        dotenv_1.default.config();
        try {
            yield exports.prisma.$connect();
            console.log("Database connected successfully");
        }
        catch (error) {
            console.error("Unable to connect to the database:", error);
            process.exit(1);
        }
        // connectDB();
        app.get("/", (req, res) => {
            res.send("API IS RUNNING!");
        });
        app.use("/auth", user_route_1.userRoutes);
        app.use("/api/products", product_route_1.productRoutes);
        app.use("/api/orders", order_route_1.orderRoutes);
        app.use("/webhook", paystack_route_1.webhookRoutes);
        app.use(errorMiddleware_1.errorHandler);
        app.listen(PORT, () => {
            console.log(`Server is running on http://localhost:${PORT}`);
        });
    });
}
main();
