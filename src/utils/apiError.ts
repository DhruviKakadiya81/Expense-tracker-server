export class ApiError extends Error {
  public statusCode: number;
  public success: boolean;
  public errors?: any;

  constructor(statusCode: number, message: string = "Something went wrong", errors?: any) {
    super(message);
    this.statusCode = statusCode;
    this.success = false;
    this.errors = errors;

    Error.captureStackTrace(this, this.constructor);
  }
}
