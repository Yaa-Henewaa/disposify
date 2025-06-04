import { NextFunction, Request, Response } from "express";

const notFound = (req: Request, res: Response, next: NextFunction) => {
  const error = new Error(`Not found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  try {
   
    const parsedError = JSON.parse(err.message);
    res.status(statusCode).json({
      error: parsedError,
      stack: process.env.NODE_ENV === "production" ? null : err.stack,
    });
  } catch (e) {
   
    res.status(statusCode).json({
      message: err.message,
      stack: process.env.NODE_ENV === "production" ? null : err.stack,
    });
  }
};

export { notFound, errorHandler };