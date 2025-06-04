import { Request } from 'express';
import { User } from '@prisma/client';

export interface AuthRequest extends Request {
  user?: Pick<User, 'id' | 'name' | 'email' | 'isAdmin'>;
}

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}