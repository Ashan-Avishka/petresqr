// src/utils/response.ts
import { Response } from 'express';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export const sendSuccess = <T>(
  res: Response,
  data?: T,
  statusCode: number = 200,
  pagination?: any
): void => {
  const response: ApiResponse<T> = {
    success: true,
    data,
    ...(pagination && { pagination })
  };
  
  res.status(statusCode).json(response);
};

export const sendError = (
  res: Response,
  message: string,
  statusCode: number = 400,
  code: string = 'ERROR',
  details?: any
): void => {
  const response: ApiResponse = {
    success: false,
    error: {
      code,
      message,
      ...(details && { details })
    }
  };
  
  res.status(statusCode).json(response);
};