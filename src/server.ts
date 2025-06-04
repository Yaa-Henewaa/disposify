import express, { Request, Response } from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import { userRoutes } from "./user/user.route";
import { productRoutes } from "./product/product.route";
import { errorHandler } from "./middleware/errorMiddleware";
import { PrismaClient } from "@prisma/client";
import { orderRoutes } from "./order/order.route";
import { webhookRoutes } from "./payment/paystack.route";

export const prisma = new PrismaClient();

const app = express();
const PORT = process.env.PORT || 3000;

async function main() {
  app.use(cors());
  app.use(express.json());
  app.use(morgan("dev"));
  dotenv.config();

  try {
    await prisma.$connect();
    console.log("Database connected successfully");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
    process.exit(1);
  }
  // connectDB();
  app.get("/", (req: Request, res: Response) => {
    res.send("API IS RUNNING!");
  });
  app.use("/auth", userRoutes);
  app.use("/api/products", productRoutes);
  app.use("/api/orders", orderRoutes);
  app.use("/webhook",webhookRoutes)

  app.use(errorHandler);

  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
}

main();
