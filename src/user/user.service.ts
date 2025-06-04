import { verificationCodeType } from "../types/verificationCode";
import { CreateUserParams, LoginUserParams } from "./user.entities";
import { sendMail } from "../utils/sendEmail";
import { getVerifyEmailTemplate } from "../utils/emailTemplates";
import * as bcrypt from "bcryptjs";
import { prisma } from "../utils/db";

export const createUser = async (data: CreateUserParams) => {
  const existingUser = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (existingUser) throw new Error("User already exists");

  const hashedPassword = await bcrypt.hash(data.password, 10);

  const user = await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      password: hashedPassword,
    },
  });

  // Create a verification code
  const verificationCode = await prisma.verificationCode.create({
    data: {
      code: Math.floor(1000 + Math.random() * 9000).toString(),
      type: "EMAILVERIFICATION",
      userId: user.id,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000),
    },
  });

  const url = `${process.env.APP_ORIGIN}/verify-email`;
  const code = verificationCode.code;
  //send verification email
  const { error } = await sendMail({
    to: data.email,
    ...getVerifyEmailTemplate(url, code),
  });
  if (error) {
    console.log(error);
  }
  return {
    user,
    verificationCode,
  };
};

export const loginUser = async (data: LoginUserParams) => {
  const user = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (!user) {
    throw new Error("Invalid email or password");
  }

  const isPasswordValid = await bcrypt.compare(data.password, user.password);

  if (!isPasswordValid) {
    throw new Error("Invalid email or password");
  }

  if (!user.verified) {
    throw new Error("Please verify your email first");
  }

  return { user };
};

export const verifyEmail = async (code: string) => {
  const verificationCode = await prisma.verificationCode.findUnique({
    where: {
      code,
      type: "EMAILVERIFICATION",
    },
    include: { user: true },
  });

  if (!verificationCode) {
    throw new Error("Invalid verification code");
  }

  if (verificationCode.expiresAt < new Date()) {
    throw new Error("Verification code has expired");
  }

  const user = await prisma.user.update({
    where: { id: verificationCode.userId },
    data: { verified: true },
  });

  await prisma.verificationCode.delete({
    where: { id: verificationCode.id },
  });

  return user;
};
