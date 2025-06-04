"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRoutes = void 0;
const express_1 = __importDefault(require("express"));
const user_controller_1 = require("./user.controller");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = express_1.default.Router();
exports.userRoutes = router;
router.get("/", authMiddleware_1.protect, authMiddleware_1.admin, user_controller_1.registerHandler);
router.post("/", user_controller_1.registerHandler);
router.post('/login', user_controller_1.loginHandler);
router.post("/verify", user_controller_1.verifyEmailHandler);
