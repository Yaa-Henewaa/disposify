import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { validationResult } from "express-validator";
import { accessToken, refreshToken } from "../utils/generateToken";
import { UserSchema } from "./user.schema";
import { createUser, loginUser, verifyEmail } from "./user.service";
import { LoginRequest, RegisterRequest } from "./user.entities";

export const loginHandler = [
  ...UserSchema.login(),
  asyncHandler(async (req: Request<{}, {}, LoginRequest>, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400);
      throw new Error(JSON.stringify({ errors: errors.array() }));
    }

    const { email, password } = req.body;

    try {
      const { user } = await loginUser({ email, password });

      res.json({
        id: user.id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        accessToken: accessToken(user.id),
        refreshToken: refreshToken(user.id),
      });
    } catch (error) {
      if (error instanceof Error) {
        res.status(401).json({ message: error.message });
      } else {
        res.status(401).json({ message: 'Login failed' });
      }
    }
  })
];

export const registerHandler = [
  ...UserSchema.register(),
  asyncHandler(async (req: Request<{}, {}, RegisterRequest>, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400);
      throw new Error(JSON.stringify({ errors: errors.array() }));
    }

    const { name, email, password } = req.body;

    try {
      const { user } = await createUser({
        name,
        email,
        password,
      });

      res.status(201).json({
        id: user.id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        accessToken: accessToken(user.id),
        refreshToken: refreshToken(user.id)
      });
    } catch (error) {
      if (error instanceof Error) {
        const status = error.message.includes('already exists') ? 409 : 400;
        res.status(status).json({ message: error.message });
      } else {
        res.status(400).json({ message: 'Registration failed' });
      }
    }
  })
];

export const verifyEmailHandler = [asyncHandler(
  async (req: Request, res: Response) => {
    const { verificationCode } = req.body;

    if (!verificationCode) {
      res.status(400).json({ message: 'Verification code is required' });
      return;
    }

    try {
 
      await verifyEmail(verificationCode);



      res.json({ message: 'Email verified successfully' });
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(400).json({ message: 'Email verification failed' });
      }
    }
  } 
)];