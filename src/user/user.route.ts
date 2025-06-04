import express from 'express';
import { loginHandler,registerHandler, verifyEmailHandler } from './user.controller';
import {protect,admin} from '../middleware/authMiddleware';

const router = express.Router();

router.get("/",protect,admin, registerHandler);
router.post("/",registerHandler);
router.post('/login', loginHandler);
router.post("/verify",verifyEmailHandler);

export {router as userRoutes};