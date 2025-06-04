export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public errors?: any[]
  ) {
    super(JSON.stringify({
      message,
      errors: errors || undefined
    }));
    Object.setPrototypeOf(this, AppError.prototype);
  }
}