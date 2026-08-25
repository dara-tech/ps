export interface ApiResponseFormat<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  timestamp: string;
}

export class ApiResponse {
  static success<T>(data: T, message?: string): ApiResponseFormat<T> {
    return {
      success: true,
      data,
      message,
      timestamp: new Date().toISOString(),
    };
  }

  static error(message: string, errors?: any): ApiResponseFormat {
    return {
      success: false,
      message,
      data: errors,
      timestamp: new Date().toISOString(),
    };
  }
}
