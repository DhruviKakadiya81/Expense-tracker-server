export interface ApiResponseOptions<T = any> {
  statusCode?: number;
  message?: string;
  data?: T;
}

export class ApiResponse<T = any> {
  public success: boolean;
  public statusCode: number;
  public message: string;
  public data: T;

  constructor(statusCode: number = 200, message: string = "Success", data?: T) {
    this.success = statusCode >= 200 && statusCode < 300;
    this.statusCode = statusCode;
    this.message = message;
    this.data = data as T;
  }
}
