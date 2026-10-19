import { Response } from "express";

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export function sendSuccess<T>(res: Response, data: T, message?: string, statusCode = 200, pagination?: ApiResponse["pagination"]) {
  const body: ApiResponse<T> = { success: true, data, message };
  if (pagination) body.pagination = pagination;
  return res.status(statusCode).json(body);
}

export function sendError(res: Response, message: string, statusCode = 500, error?: string) {
  return res.status(statusCode).json({ success: false, message, error });
}
