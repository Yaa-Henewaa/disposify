import { NextFunction, Response } from "express";
import jwt from "jsonwebtoken";
import { prisma } from "../utils/db";
import asyncHandler from "express-async-handler";
import { AuthRequest } from "../types/express";

const protect = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    res.status(401);
    throw new Error('Not authorized');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string };
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, name: true, email: true, isAdmin: true }
    });

    if (!user) {
      res.status(401);
      throw new Error('User not found');
    }

    req.user = user; 
    next();
  } catch (error) {
    res.status(401);
    throw new Error('Not authorized');
  }
});

const admin = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user?.isAdmin) { 
    res.status(403);
    throw new Error('Not authorized as admin');
  }
  next();
});

export { protect, admin };